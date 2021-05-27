import semver from 'semver'
import { createLogger } from '../utils/logger'
import * as shell from '../utils/shell'
import { createDoctorResult, DoctorResult } from '../utils/common'
import chalk from 'chalk'

export enum Status {
  Good,
  NotGitRepo,
  HuskyNotInstalled,
  LegacyHuskyInstalled,
  PrettierHookNotFound,
}

export function getResult(status: Status): DoctorResult {
  switch (status) {
    case Status.Good:
      return createDoctorResult(
        'success',
        'Git hooks are properly installed and configured.'
      )
    case Status.NotGitRepo:
      return createDoctorResult('error', 'Current directory is not a Git repo.')
    case Status.HuskyNotInstalled:
      return createDoctorResult('error', 'Could not find husky for git hook.')
    case Status.LegacyHuskyInstalled:
      return createDoctorResult(
        'warn',
        'Found legacy version of husky installed.'
      )
    case Status.PrettierHookNotFound:
      return createDoctorResult(
        'warn',
        'Could not find pre-commit hook to run prettier.'
      )
  }
}

export async function fix(status: Status) {
  const logger = createLogger(shell.$.logLevel)

  switch (status) {
    case Status.Good:
      return
    case Status.NotGitRepo:
      logger.info(
        chalk.yellow(
          `Skipping...You need to initialize current directory as git repo first.`
        )
      )
      return
    case Status.HuskyNotInstalled:
      logger.info('Installing husky...')
      await shell.$`yarn add husky -D`
      await shell.setNpmScript('prepare', 'husky install')
      await shell.$`npm run prepare`
      logger.info('Adding hooks with husky...')
      await shell.addHuskyGitHook('pre-commit', 'npx pretty-quick --staged')
      break
    case Status.LegacyHuskyInstalled:
      logger.info(
        chalk.yellow(
          `Skipping...to migrate to latest version of husky, see ${chalk.underline(
            'https://typicode.github.io/husky/#/?id=migrate-from-v4-to-v6'
          )}`
        )
      )
      return
    case Status.PrettierHookNotFound:
      await shell.setNpmScript('prepare', 'husky install')
      await shell.$`npm run prepare`
      logger.info('Adding hooks with husky...')
      await shell.addHuskyGitHook('pre-commit', 'npx pretty-quick --staged')
      break
  }

  logger.info('Git hooks fixed!')
}

export async function check(): Promise<Status> {
  const logger = createLogger(shell.$.logLevel)
  logger.info('Checking Git hooks...')

  if (!(await shell.isInsideGitRepo())) {
    return Status.NotGitRepo
  }

  if (!(await shell.isNpmModuleInstalled('husky'))) {
    return Status.HuskyNotInstalled
  }

  const huskyVersion = await shell.getInstalledModuleVersion('husky')
  if (semver.satisfies(huskyVersion as string, '<6')) {
    return Status.LegacyHuskyInstalled
  }

  if (
    !(await shell.hasHuskyGitHook('pre-commit', ['prettier', 'pretty-quick']))
  ) {
    return Status.PrettierHookNotFound
  }

  return Status.Good
}
