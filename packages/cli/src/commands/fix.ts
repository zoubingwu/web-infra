import * as prettier from './prettier'
import * as git from './git'
import * as shell from '../utils/shell'
import { createLogger } from '../utils/logger'

export async function fix() {
  const logger = createLogger(shell.$.logLevel)
  const prettierStatus = await prettier.check()

  logger.info(`Prettier status: ${prettier.Status[prettierStatus]}`)

  if (prettierStatus !== prettier.Status.Good) {
    await prettier.fix(prettierStatus)
  }

  const gitStatus = await git.check()
  logger.info(`Git hooks status: ${git.Status[gitStatus]}`)

  if (gitStatus !== git.Status.Good) {
    await git.fix(gitStatus)
  }

  logger.info('\nEverything is fine now! Enjoy your coding!')
}
