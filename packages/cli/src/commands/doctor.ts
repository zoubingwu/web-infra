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
import { createLogger } from '../utils/logger'
import * as shell from '../utils/shell'

export async function doctor() {
  const results = []

  const prettierStatus = await checkPrettier()
  createLogger(shell.$.logLevel).debug(
    `\nPrettier Status shell.${PrettierStatus[prettierStatus]}`
  )

  const gitStatus = await checkGitHooks()
  createLogger(shell.$.logLevel).debug(
    `\nGit hooks Status shell.${GitHookStatus[gitStatus]}`
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
    createLogger(shell.$.logLevel)[level](
      resultLevelToLogSymbol[r.type] + ' ' + r.result
    )
  })

  if (results.every(r => r.type !== 'error')) {
    createLogger(shell.$.logLevel).info(
      `\nYou passed every check, enjoy coding!`
    )
  } else {
    createLogger(shell.$.logLevel).info(`\nTry \`wi fix\` to do a quick fix.`)
  }
}

export function printTip(results: DoctorResult[]) {}
