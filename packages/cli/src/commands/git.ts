import semver from 'semver'
import { createLogger } from '../utils/logger'
import * as shell from '../utils/shell'
import { createDoctorResult, DoctorResult } from '../utils/common'

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
      return createDoctorResult('success', 'Git hooks are properly installed.')
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
  switch (status) {
    case Status.Good:
      return
    case Status.NotGitRepo:
      await shell.$`git init`
    case Status.HuskyNotInstalled:
      await shell.$`yarn add husky -D`
      await shell.setNpmScript('prepare', 'husky install')
      await shell.$`npm run prepare`
      await shell.addHuskyGitHook('pre-commit', 'npx pretty-quick --staged')
      return
    case Status.LegacyHuskyInstalled:
      await shell.$`npx husky-init && npm exec -- github:typicode/husky-4-to-6 --remove-v4-config`
      return
    case Status.PrettierHookNotFound:
      await shell.setNpmScript('prepare', 'husky install')
      await shell.$`npm run prepare`
      await shell.addHuskyGitHook('pre-commit', 'npx pretty-quick --staged')
      return
  }
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

  await shell.getInstalledModuleVersion('debug')
  const huskyVersion = await shell.getInstalledModuleVersion('husky')
  if (semver.satisfies(huskyVersion as string, ' < 6.0.0')) {
    return Status.LegacyHuskyInstalled
  }

  if (
    !(await shell.hasHuskyGitHook('pre-commit', ['prettier', 'pretty-quick']))
  ) {
    return Status.PrettierHookNotFound
  }

  return Status.Good
}
