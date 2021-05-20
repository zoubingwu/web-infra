import { cac } from 'cac'
import { doctor } from './commands/doctor'

const cli = cac('wi')

cli.command('[commands] [options]').action(() => {
  cli.outputHelp()
})

cli
  .command(
    'doctor',
    'Run a full check based on a list of internal conventions.'
  )
  .action(async (root: string) => {
    console.log('root: ', root)

    try {
      await doctor()
    } catch {
      process.exit(1)
    }
  })

cli.command('fix', 'Quick fix').action(async (entry: string) => {
  try {
    await doctor()
  } catch {
    process.exit(1)
  }
})

cli.help()
cli.version(require('../package.json').version)
cli.parse()
