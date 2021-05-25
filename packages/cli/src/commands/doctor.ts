import * as prettier from './prettier'
import * as git from './git'
import { DoctorResult, resultLevelToLogSymbol } from '../utils/common'
import { createLogger } from '../utils/logger'
import * as shell from '../utils/shell'

export async function doctor() {
  const results = []
  const logger = createLogger(shell.$.logLevel)

  const prettierStatus = await prettier.check()
  logger.info(`Prettier Status: ${prettier.Status[prettierStatus]}`)

  const gitStatus = await git.check()
  logger.info(`Git hooks status: ${git.Status[gitStatus]}`)

  results.push(prettier.getResult(prettierStatus))
  results.push(git.getResult(gitStatus))

  printResult(results)
}

export function printResult(results: DoctorResult[]) {
  const logger = createLogger(shell.$.logLevel)

  results.forEach(r => {
    const level = r.type === 'success' ? 'info' : r.type
    logger[level](resultLevelToLogSymbol[r.type] + ' ' + r.result)
  })

  if (results.every(r => r.type !== 'error')) {
    logger.info(`\nYou passed every check, enjoy coding!`)
  } else {
    logger.info(`\nTry \`wi fix\` to do a quick fix.`)
  }
}
