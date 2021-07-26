import { cac } from 'cac'
import chalk from 'chalk'

import packgeJson from '../package.json'

import { doctor } from './commands/doctor'
import { fix } from './commands/fix'
import { review, ReviewOptions } from './commands/review'
import { createLogger, LogLevel } from './utils/logger'
import * as shell from './utils/shell'

const version = packgeJson.version

const cli = cac('wi')

interface GlobalOptions {
  '--': string[]
  logLevel?: LogLevel
  l?: LogLevel
}

cli.option('-l, --logLevel <level>', `[string] silent | error | warn | info | debug`)

async function runDoctor(options: GlobalOptions) {
  shell.setLogLevel(options?.logLevel)
  try {
    await doctor()
  } catch (e) {
    createLogger(options?.logLevel).error(chalk.red(`error when running doctor, ${e.message}:\n${e.stack}`))
    process.exit(1)
  }
}

cli.command('<commands> [options]').action(runDoctor)

cli.command('doctor', 'Run a full check based on a list of internal conventions.').alias('check').action(runDoctor)

cli
  .command('fix', 'Run a full check and do quick fix')
  .example('wi fix prettier')
  .example('wi fix eslint')
  .example('wi fix git')
  .action(async (options: GlobalOptions) => {
    shell.setLogLevel(options?.logLevel)
    try {
      await fix()
    } catch (e) {
      createLogger(options?.logLevel).error(chalk.red(`error when running fix, ${e.message}:\n${e.stack}`))
      process.exit(1)
    }
  })

cli
  .command('review <pr>', 'Fetch and review pull request.')
  .option('-c, --clean', 'Clean fetched pull request.')
  .example('wi review 932')
  .example('wi review 932 --clean')
  .action(async (pr: string, options: GlobalOptions & ReviewOptions) => {
    shell.setLogLevel(options?.logLevel)
    try {
      await review(pr, { clean: options.clean })
    } catch (e) {
      createLogger(options?.logLevel).error(chalk.red(`error when running github, ${e.message}:\n${e.stack}`))
      process.exit(1)
    }
  })

cli.help()
cli.version(version)
cli.parse()
