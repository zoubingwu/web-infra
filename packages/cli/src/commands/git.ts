import semver from 'semver'
import { createLogger } from '../utils/logger'
import * as shell from '../utils/shell'
import { createDoctorResult, Doctor } from '../utils/common'
import chalk from 'chalk'

enum GitStatus {
  Good,
  NotGitRepo,
  HuskyNotInstalled,
  LegacyHuskyInstalled,
  PrettierHookNotFound,
}

class GitDoctor extends Doctor {
  name = 'Git'

  protected async getStatus() {
    if (!(await shell.isInsideGitRepo())) {
      return GitStatus.NotGitRepo
    }

    if (!(await shell.isNpmModuleInstalled('husky'))) {
      return GitStatus.HuskyNotInstalled
    }

    const huskyVersion = await shell.getInstalledModuleVersion('husky')
    if (semver.satisfies(huskyVersion as string, '<6')) {
      return GitStatus.LegacyHuskyInstalled
    }

    if (
      !(await shell.hasHuskyGitHook('pre-commit', ['prettier', 'pretty-quick']))
    ) {
      return GitStatus.PrettierHookNotFound
    }

    return GitStatus.Good
  }

  protected getDescriptiveStatus(status: GitStatus) {
    return GitStatus[status]
  }

  getDoctorResult(status: GitStatus) {
    switch (status) {
      case GitStatus.Good:
        return createDoctorResult(
          'success',
          'Git hooks are properly installed and configured.'
        )
      case GitStatus.NotGitRepo:
        return createDoctorResult(
          'error',
          'Current directory is not a Git repo.'
        )
      case GitStatus.HuskyNotInstalled:
        return createDoctorResult('error', 'Could not find husky for git hook.')
      case GitStatus.LegacyHuskyInstalled:
        return createDoctorResult(
          'warn',
          'Found legacy version of husky installed.'
        )
      case GitStatus.PrettierHookNotFound:
        return createDoctorResult(
          'warn',
          'Could not find pre-commit hook to run prettier.'
        )
    }
  }

  async fix(status: GitStatus) {
    const logger = createLogger(shell.$.logLevel)

    switch (status) {
      case GitStatus.Good:
        return
      case GitStatus.NotGitRepo:
        logger.info(
          chalk.yellow(
            `Skipping...You need to initialize current directory as git repo first.`
          )
        )
        return
      case GitStatus.HuskyNotInstalled:
        logger.info('Installing husky...')
        await shell.$`yarn add husky -D`
        await shell.setNpmScript('prepare', 'husky install')
        await shell.$`npm run prepare`
        logger.info('Adding hooks with husky...')
        await shell.addHuskyGitHook('pre-commit', 'npx pretty-quick --staged')
        break
      case GitStatus.LegacyHuskyInstalled:
        logger.info(
          chalk.yellow(
            `Skipping...to migrate to latest version of husky, see ${chalk.underline(
              'https://typicode.github.io/husky/#/?id=migrate-from-v4-to-v6'
            )}`
          )
        )
        return
      case GitStatus.PrettierHookNotFound:
        await shell.setNpmScript('prepare', 'husky install')
        await shell.$`npm run prepare`
        logger.info('Adding hooks with husky...')
        await shell.addHuskyGitHook('pre-commit', 'npx pretty-quick --staged')
        break
    }

    logger.info('Git hooks fixed!')
  }
}

export const gitDoctor = new GitDoctor()
