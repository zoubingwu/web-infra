import chalk from 'chalk'
import logSymbols from 'log-symbols'

import * as shell from './shell'
import { createLogger } from './logger'

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

export function createDoctorResult(type: DoctorResultType, res: string): DoctorResult {
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

export abstract class Doctor {
  public abstract name: string

  public async check() {
    const logger = createLogger(shell.$.logLevel)
    logger.info(`Checking ${this.name} status...`)
    const res = await this.getStatus()
    logger.info(`${this.name} status: ${this.getDescriptiveStatus(res)}`)
    return res
  }

  public abstract getDoctorResult(status: number): DoctorResult

  public abstract fix(status: number): Promise<void>

  protected abstract getStatus(): Promise<number>

  protected abstract getDescriptiveStatus(status: number): string
}
