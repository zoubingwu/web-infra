import { exec } from 'child_process'
import { promisify } from 'util'
import shq from 'shq'

interface ProcessOutputOptions {
  code: number
  stdout: string
  stderr: string
  combined: string
}

class ProcessOutput {
  #code = 0
  #stdout = ''
  #stderr = ''
  #combined = ''

  constructor({ code, stdout, stderr, combined }: ProcessOutputOptions) {
    this.#code = code
    this.#stdout = stdout
    this.#stderr = stderr
    this.#combined = combined
  }

  toString() {
    return this.#combined
  }

  get stdout() {
    return this.#stdout
  }

  get stderr() {
    return this.#stderr
  }

  get exitCode() {
    return this.#code
  }
}

function substitute(arg: any) {
  if (arg instanceof ProcessOutput) {
    return arg.stdout.replace(/\n$/, '')
  }
  return arg.toString()
}

export function $(pieces: TemplateStringsArray, ...args: any[]) {
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

  return new Promise((resolve, reject) => {
    let options = {
      windowsHide: true,
    }

    let child = exec(cmd, options)
    let stdout = '',
      stderr = '',
      combined = ''

    child?.stdout?.on('data', data => {
      stdout += data
      combined += data
    })

    child?.stderr?.on('data', data => {
      stderr += data
      combined += data
    })

    child.on('exit', (code: number) => {
      child.on('close', () => {
        ;(code === 0 ? resolve : reject)(
          new ProcessOutput({ code, stdout, stderr, combined })
        )
      })
    })
  })
}

export const sleep = promisify(setTimeout)
