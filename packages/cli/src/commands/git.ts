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

  async getPreCommitScript() {
    const root = await shell.getProjectRoot()
    const cwd = process.cwd()
    const ispackageJsonSameLevelWithGit = root === cwd

    if (ispackageJsonSameLevelWithGit) {
      return `npx pretty-quick --staged`
    }

    return (
      `formatter=${
        '$' + '(pwd)' + cwd.replace(root, '')
      }/node_modules/.bin/pretty-quick \n` +
      `if test -f "$formatter"; then \n` +
      `  $formatter --pattern "**/*.*(ts|tsx|js|jsx|html|css)" --staged \n` +
      `fi`
    )
  }

  async installHusky() {
    const logger = createLogger(shell.$.logLevel)
    logger.info('Installing husky...')
    await shell.$`yarn add husky -D`
    const root = await shell.getProjectRoot()
    const cwd = process.cwd()
    const ispackageJsonSameLevelWithGit = root === cwd
    if (ispackageJsonSameLevelWithGit) {
      await shell.setNpmScript('prepare', 'husky install')
    } else {
      logger.info(`Found git root is not the same level with package.json`)
      await shell.setNpmScript(
        'prepare',
        `cd \`git rev-parse --show-toplevel\` && husky install ${cwd.replace(
          root + '/',
          ''
        )}/.husky`
      )
    }
    await shell.$`npm run prepare`
  }

  async addPreCommitPrettierHook() {
    const logger = createLogger(shell.$.logLevel)
    logger.info('Adding prettier hooks with husky...')
    const script = await this.getPreCommitScript()
    await shell.addHuskyGitHook('pre-commit', script)
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
        await this.installHusky()
        await this.addPreCommitPrettierHook()
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
        await this.installHusky() // make sure husky is properly configured
        await this.addPreCommitPrettierHook()
        break
    }

    logger.info('Git hooks fixed!')
  }
}

export const gitDoctor = new GitDoctor()
