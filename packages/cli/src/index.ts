import { cac } from 'cac'
import chalk from 'chalk'
import { doctor } from './commands/doctor'
import { fix } from './commands/fix'
import { createLogger, LogLevel } from './utils/logger'
import { setScriptRunnerLogLevel } from './utils/script'

const cli = cac('wi')

export interface GlobalOptions {
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
    'doctor [root]',
    'Run a full check based on a list of internal conventions.'
  )
  .action(async (root: string, options?: GlobalOptions) => {
    setScriptRunnerLogLevel(options?.logLevel)
    try {
      await doctor()
    } catch (e) {
      createLogger(options?.logLevel).error(
        chalk.red(`error when running check:\n${e.stack}`)
      )
      process.exit(1)
    }
  })

cli
  .command('fix [scope]', 'Run a quick fix or only for certain scope.')
  .example('wi fix prettier')
  .example('wi fix eslint')
  .action(async (entry: string) => {
    try {
      await fix(entry)
    } catch {
      process.exit(1)
    }
  })

cli.help()
cli.version(require('../package.json').version)
cli.parse()
