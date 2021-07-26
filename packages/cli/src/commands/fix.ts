import * as shell from '../utils/shell'
import { createLogger } from '../utils/logger'

import { prettierDoctor } from './prettier'
import { gitDoctor } from './git'
import { eslintDoctor } from './eslint'

export async function fix() {
  const logger = createLogger(shell.$.logLevel)

  const prettierStatus = await prettierDoctor.check()
  await prettierDoctor.fix(prettierStatus)

  const gitStatus = await gitDoctor.check()
  await gitDoctor.fix(gitStatus)

  const eslintStatus = await eslintDoctor.check()
  await eslintDoctor.fix(eslintStatus)

  logger.info('\nDone! Enjoy your coding!')
}
