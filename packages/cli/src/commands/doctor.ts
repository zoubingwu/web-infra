import chalk from 'chalk'
import logSymbols from 'log-symbols'
import { createLogger } from '../utils/logger'
import { $ } from '../utils/script'
import { checkPrettier } from './prettier'

export type DoctorResultType = 'warn' | 'error' | 'success'

export interface DoctorResult {
  type: DoctorResultType
  result: string
}

export function createDoctorResult(
  type: DoctorResultType,
  res: string
): DoctorResult {
  let result
  if (type === 'error') {
    result = chalk.red(res)
  } else if (type === 'warn') {
    result = chalk.yellow(res)
  } else {
    result = chalk.green(res)
  }

  return { type, result }
}

export const resultLevelToLogSymbol: Record<DoctorResultType, string> = {
  success: logSymbols.success,
  error: logSymbols.error,
  warn: logSymbols.warning,
}

export async function doctor() {
  const results = []

  results.push(await checkPrettier())

  printResult(results)
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
