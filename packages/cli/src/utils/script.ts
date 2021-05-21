import { exec } from 'child_process'
import { promisify } from 'util'
import shq from 'shq'
import chalk from 'chalk'
import { createLogger, LogLevel } from './logger'

class ProcessOutput {
  constructor(
    public code: number,
    public stdout: string,
    public stderr: string,
    private combined: string,
    public stack?: string
  ) {}

  toString() {
    return this.combined
  }

  get exitCode() {
    return this.code
  }
}

function substitute(arg: any) {
  if (arg instanceof ProcessOutput) {
    return arg.stdout.replace(/\n$/, '')
  }
  return arg.toString()
}

export function colorize(cmd: string) {
  return cmd.replace(/^\w+(\s|$)/, substr => {
    return chalk.greenBright(substr)
  })
}

export type TypeOf$ = {
  (pieces: TemplateStringsArray, ...args: any[]): Promise<ProcessOutput>
  logLevel?: LogLevel
}

export const $: TypeOf$ = (
  pieces: TemplateStringsArray,
  ...args: any[]
): Promise<ProcessOutput> => {
  let stack = new Error()?.stack
  let cmd = pieces[0],
    i = 0

  while (i < args.length) {
    let s
    if (Array.isArray(args[i])) {
      s = args[i].map((x: any) => shq(substitute(x))).join(' ')
    } else {
      s = shq(substitute(args[i]))
    }
    cmd += s + pieces[++i]
  }

  createLogger($.logLevel).debug(`\n$ ${colorize(cmd)}`)

  return new Promise((resolve, reject) => {
    let options = {
      windowsHide: true,
    }

    let child = exec(cmd, options)
    let stdout = '',
      stderr = '',
      combined = ''

    child?.stdout?.on('data', data => {
      if ($.logLevel === 'debug') {
        process.stdout.write(data)
      }
      stdout += data
      combined += data
    })

    child?.stderr?.on('data', data => {
      if ($.logLevel === 'debug') {
        process.stdout.write(data)
      }
      stderr += data
      combined += data
    })

    child.on('exit', (code: number) => {
      child.on('close', () => {
        createLogger($.logLevel).debug(`\n`)
        resolve(new ProcessOutput(code, stdout, stderr, combined, stack))
      })
    })
  })
}

export const setScriptRunnerLogLevel = (level: LogLevel = 'info') =>
  ($.logLevel = level)

export const sleep = promisify(setTimeout)
