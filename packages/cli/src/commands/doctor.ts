import logSymbols from 'log-symbols'
import { createLogger } from '../utils/logger'
import { checkPrettier } from './prettier'

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

export async function doctor() {
  const results = await Promise.all([checkPrettier()])

  printResult(results)
}

export function printResult(results: DoctorResult[]) {
  results.forEach(r => {
    const level = r.type === 'success' ? 'info' : r.type
    createLogger('info')[level](resultLevelToLogSymbol[r.type] + ' ' + r.result)
  })

  if (results.every(r => r.type !== 'error')) {
    createLogger('info').info('\nYou passed every check, enjoy coding!')
  }
}
