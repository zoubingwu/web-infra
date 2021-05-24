import chalk from 'chalk'
import logSymbols from 'log-symbols'

export type DoctorResultType = 'warn' | 'error' | 'success'

export interface DoctorResult {
  type: DoctorResultType
  result: string
}

export const resultLevelToLogSymbol: Record<DoctorResultType, string> = {
  success: logSymbols.success,
  error: logSymbols.error,
  warn: logSymbols.warning,
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
