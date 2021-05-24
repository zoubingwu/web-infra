import { createLogger } from '../utils/logger'
import { $ } from '../utils/script'
import {
  checkPrettier,
  getDescriptivePrettierResult,
  PrettierStatus,
} from './prettier'
import {
  checkGitHooks,
  getDescriptiveGitHookResult,
  GitHookStatus,
} from './git'
import { DoctorResult, resultLevelToLogSymbol } from '../utils/common'

export async function doctor() {
  const results = []

  const prettierStatus = await checkPrettier()
  createLogger($.logLevel).debug(
    `\nPrettier Status ${PrettierStatus[prettierStatus]}`
  )

  const gitStatus = await checkGitHooks()
  createLogger($.logLevel).debug(
    `\nGit hooks Status ${GitHookStatus[gitStatus]}`
  )

  results.push(
    getDescriptivePrettierResult(prettierStatus),
    getDescriptiveGitHookResult(gitStatus)
  )

  printResult(results)
  printTip(results)
}

export function printResult(results: DoctorResult[]) {
  results.forEach(r => {
    const level = r.type === 'success' ? 'info' : r.type
    createLogger($.logLevel)[level](
      resultLevelToLogSymbol[r.type] + ' ' + r.result
    )
  })

  if (results.every(r => r.type !== 'error')) {
    createLogger($.logLevel).info(`\nYou passed every check, enjoy coding!`)
  } else {
    createLogger($.logLevel).info(`\nTry \`wi fix\` to do a quick fix.`)
  }
}

export function printTip(results: DoctorResult[]) {}
