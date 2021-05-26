import { cac } from 'cac'
import chalk from 'chalk'
import { doctor } from './commands/doctor'
import { fix } from './commands/fix'
import { createLogger, LogLevel } from './utils/logger'
import * as shell from './utils/shell'

const cli = cac('wi')

interface GlobalOptions {
  '--': string[]
  logLevel?: LogLevel
  l?: LogLevel
}

cli.option(
  '-l, --logLevel <level>',
  `[string] silent | error | warn | info | debug`
)

cli.command('[commands] [options]').action(() => {
  cli.outputHelp()
})

cli
  .command(
    'doctor',
    'Run a full check based on a list of internal conventions.'
  )
  .alias('check')
  .action(async (options: GlobalOptions) => {
    shell.setLogLevel(options?.logLevel)
    try {
      await doctor()
    } catch (e) {
      createLogger(options?.logLevel).error(
        chalk.red(`error when running doctor, ${e.message}:\n${e.stack}`)
      )
      process.exit(1)
    }
  })

cli
  .command('fix', 'Run a quick fix or only for certain scope. eg fix prettier')
  .example('wi fix prettier')
  .example('wi fix eslint')
  .example('wi fix git')
  .action(async (options: GlobalOptions) => {
    shell.setLogLevel(options?.logLevel)
    try {
      await fix()
    } catch (e) {
      createLogger(options?.logLevel).error(
        chalk.red(`error when running fix, ${e.message}:\n${e.stack}`)
      )
      process.exit(1)
    }
  })

cli.help()
cli.version(require('../package.json').version)
cli.parse()
