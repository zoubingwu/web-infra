import semver from 'semver'
import chalk from 'chalk'

import { createLogger } from '../utils/logger'
import * as shell from '../utils/shell'
import { createDoctorResult, Doctor } from '../utils/common'
import { writeFilePreservingEol } from '../utils/fs'

enum GitStatus {
  Good,
  NotGitRepo,
  HuskyNotInstalled,
  LegacyHuskyInstalled,
  PrettierHookNotFound,
}

const defaultLintStagedConfig = `module.exports = {
  '*.{js,ts,jsx,tsx}': [
    'eslint --fix',
    "prettier --write --ignore-unknown"
  ],
  "*.+(json|css|md)": [
    "prettier --write"
  ]
}
`

class GitDoctor extends Doctor {
  public name = 'Git'

  public getDoctorResult(status: GitStatus) {
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

  public async getPreCommitScript() {
    const root = await shell.getProjectRoot()
    const cwd = process.cwd()
    const isPackageJsonSameLevelWithGit = root === cwd

    if (isPackageJsonSameLevelWithGit) {
      return `npx lint-staged --config ./.lintstagedrc.js`
    }
    const packageJsonPath = `$(pwd)${cwd.replace(root, '')}`
    return (
      `export PATH="$PATH:${packageJsonPath}/node_modules/.bin"\n` +
      `linter=${packageJsonPath}/node_modules/.bin/lint-staged\n` +
      `if test -f "$linter"; then\n` +
      `  $linter --config ${packageJsonPath}/.lintstagedrc.js\n` +
      `fi`
    )
  }

  public async installHusky() {
    const logger = createLogger(shell.$.logLevel)
    logger.info('Installing husky, lint-staged...')
    await shell.$`yarn add husky is-ci lint-staged -D`
    const root = await shell.getProjectRoot()
    const cwd = process.cwd()
    const isPackageJsonSameLevelWithGit = root === cwd
    if (isPackageJsonSameLevelWithGit) {
      await shell.setNpmScript('prepare', 'is-ci || husky install')
    } else {
      logger.info(`Found git root is not the same level with package.json`)
      await shell.setNpmScript(
        'prepare',
        `is-ci || cd \`git rev-parse --show-toplevel\` && husky install ${cwd.replace(
          root + '/',
          ''
        )}/.husky`
      )
    }
    await shell.$`npm run prepare`
  }

  public async setupLintStaged() {
    const logger = createLogger(shell.$.logLevel)
    logger.info('Setting up lint-staged...')
    await writeFilePreservingEol(
      `${process.cwd()}/.lintstagedrc.js`,
      defaultLintStagedConfig
    )
  }

  public async addPreCommitPrettierHook() {
    const logger = createLogger(shell.$.logLevel)
    await this.setupLintStaged()
    logger.info('Adding prettier hooks with husky...')
    const script = await this.getPreCommitScript()
    await shell.addHuskyGitHook('pre-commit', script)
  }

  public async fix(status: GitStatus) {
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
      !(await shell.hasHuskyGitHook('pre-commit', [
        'prettier',
        'pretty-quick',
        'lint-staged',
      ]))
    ) {
      return GitStatus.PrettierHookNotFound
    }

    return GitStatus.Good
  }

  protected getDescriptiveStatus(status: GitStatus) {
    return GitStatus[status]
  }
}

export const gitDoctor = new GitDoctor()
