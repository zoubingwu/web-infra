import path from 'path'
import fs from 'fs'
import fsp from 'fs/promises'
import { promisify } from 'util'
import { exec } from 'child_process'

import semver from 'semver'
import shq from 'shq'
import chalk from 'chalk'
import detectIndent from 'detect-indent'

import { createLogger, LogLevel } from './logger'
import { DEFAULT_INDENT } from './constants'

/**
 * Get the whole project root, equals git root
 */
async function getProjectRoot(): Promise<string> {
  const { stdout: root } = await $`git rev-parse --show-toplevel`
  return root.trim()
}

interface PackageJSON {
  path: string
  json: any
  indent: string
}

async function getPacakgeJson(dir: string): Promise<PackageJSON> {
  try {
    const file = await fsp.readFile(path.resolve(dir, 'package.json'), 'utf8')
    const indent = detectIndent(file).indent || DEFAULT_INDENT
    return {
      path: `${dir}/package.json`,
      json: JSON.parse(file),
      indent,
    }
  } catch {
    throw new Error('Could not find package.json.')
  }
}

async function getCurrentDirectoryPackageJson() {
  return await getPacakgeJson(process.cwd())
}

async function isNpmModuleInstalled(moduleName: string): Promise<boolean> {
  try {
    const version = await getInstalledModuleVersion(moduleName)
    return Boolean(version)
  } catch {
    return false
  }
}

function isFileExist(fileName: string) {
  return fs.existsSync(fileName)
}

async function isInsideGitRepo() {
  try {
    const { stdout } = await $`git rev-parse --is-inside-work-tree`
    return stdout.trim() === 'true'
  } catch {
    return false
  }
}

async function setNpmScript(name: string, script: string) {
  try {
    await $`npm set-script ${name} ${script}`
  } catch {
    // TODO npm set-script requires npm v7, do fallback here
  }
}

type HookTypes =
  | 'pre-commit'
  | 'prepare-commit-msg'
  | 'commit-msg'
  | 'post-commit'

async function addHuskyGitHook(name: HookTypes, script: string) {
  // npx husky add can't deal with script like `echo '$(pwd)' so we use our own implementation`
  const filename = `.husky/${name}`
  if (isFileExist(filename)) {
    await fsp.appendFile(filename, script + '\n')
  } else {
    await fsp.writeFile(
      filename,
      '#!/bin/sh\n. "$(dirname "$0")/_/husky.sh"\n\n' + script + '\n'
    )
    await fsp.chmod(filename, '755')
  }
}

type ModuleInHooks = 'prettier' | 'eslint' | 'pretty-quick' | 'lint-staged'

async function hasHuskyGitHook(
  type: HookTypes,
  names: ModuleInHooks | ModuleInHooks[]
): Promise<boolean> {
  try {
    const huskyPath = path.join(process.cwd(), '.husky', type)
    const { stdout } = await $`cat ${huskyPath.trim()}`
    const checkingModuleNames = Array.isArray(names) ? names : [names]
    return checkingModuleNames.some(name => stdout.includes(name))
  } catch {
    return false
  }
}

async function getInstalledModuleVersion(name: string): Promise<string | null> {
  try {
    const { stdout } = await $`npm list ${name} | grep ${name}`
    const versions: [string, semver.SemVer][] = stdout
      .trim()
      .split('\n')
      .map(s => s.slice(s.indexOf(name)).split('@')) // [['module1', '1.0.0'], ['module1', '2.0.0']]
      .map(([k, v]) => [k, semver.coerce(v)!])

    if (versions.length > 1) {
      versions.sort((a, b) => b[1].compare(a[1])) // put newer version on top
    }

    return versions[0][1].format()
  } catch (e) {
    return null
  }
}

class ProcessOutput {
  public readonly code: number
  public readonly stdout: string
  public readonly stderr: string
  public readonly stack?: string
  private readonly combined: string

  // eslint-disable-next-line max-params
  public constructor(
    code: number,
    stdout: string,
    stderr: string,
    combined: string,
    stack?: string
  ) {
    this.code = code
    this.stdout = stdout
    this.stderr = stderr
    this.combined = combined
    this.stack = stack
  }

  public toString() {
    return this.combined
  }

  public get exitCode() {
    return this.code
  }

  public get message() {
    return this.stderr
  }
}

function substitute(arg: any) {
  if (arg instanceof ProcessOutput) {
    return arg.stdout.replace(/\n$/, '')
  }
  return arg.toString()
}

function colorize(cmd: string) {
  return cmd.replace(/^\w+(\s|$)/, substr => {
    return chalk.greenBright(substr)
  })
}

interface ShellRunner {
  (pieces: TemplateStringsArray, ...args: any[]): Promise<ProcessOutput>
  logLevel?: LogLevel
}

const $: ShellRunner = (
  pieces: TemplateStringsArray,
  ...args: any[]
): Promise<ProcessOutput> => {
  let stack = new Error()?.stack
  let cmd = pieces[0]
  let i = 0

  while (i < args.length) {
    let s
    if (Array.isArray(args[i])) {
      s = args[i].map((x: any) => shq(substitute(x))).join(' ')
    } else {
      s = shq(substitute(args[i]))
    }
    cmd += s + pieces[++i]
  }

  createLogger($.logLevel).debug(`\n===== script: ${colorize(cmd)}`)

  return new Promise((resolve, reject) => {
    let options = {
      windowsHide: true,
    }

    let child = exec(cmd, options)
    let stdout = ''
    let stderr = ''
    let combined = ''

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
        createLogger($.logLevel).debug(`===== code: ${code}`)
        const res = new ProcessOutput(code, stdout, stderr, combined, stack)
        code === 0 ? resolve(res) : reject(res)
      })
    })
  })
}

const sleep = promisify(setTimeout)

const setLogLevel = (level: LogLevel = 'info') => {
  $.logLevel = level
}

export {
  $,
  getProjectRoot,
  getCurrentDirectoryPackageJson,
  isNpmModuleInstalled,
  isFileExist,
  isInsideGitRepo,
  setNpmScript,
  addHuskyGitHook,
  hasHuskyGitHook,
  getInstalledModuleVersion,
  sleep,
  setLogLevel,
}
