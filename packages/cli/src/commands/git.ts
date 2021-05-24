import semver from 'semver'
import { createLogger } from '../utils/logger'
import * as shell from '../utils/shell'
import { $ } from '../utils/script'
import { createDoctorResult, DoctorResult } from '../utils/common'

export enum GitHookStatus {
  Good,
  NotGitRepo,
  HuskyNotInstalled,
  LegacyHuskyInstalled,
  PrettierHookNotFound,
}

export function getDescriptiveGitHookResult(
  status: GitHookStatus
): DoctorResult {
  switch (status) {
    case GitHookStatus.Good:
      return createDoctorResult('success', 'Git hooks are properly installed.')
    case GitHookStatus.NotGitRepo:
      return createDoctorResult('error', 'Current directory is not a Git repo.')
    case GitHookStatus.HuskyNotInstalled:
      return createDoctorResult('warn', 'Could not find husky for git hook.')
    case GitHookStatus.LegacyHuskyInstalled:
      return createDoctorResult(
        'warn',
        'Found legacy version of husky installed.'
      )
    case GitHookStatus.PrettierHookNotFound:
      return createDoctorResult(
        'warn',
        'Could not find pre-commit hook to run prettier.'
      )
  }
}

export async function fixGitHookByStatus(status: GitHookStatus) {
  switch (status) {
    case GitHookStatus.Good:
      return
    case GitHookStatus.HuskyNotInstalled:
      await $`yarn add husky -D && npm set-script "prepare:husky" "husky install" && npx husky install`
      await shell.addHuskyGitHook('pre-commit', 'npx pretty-quick --staged')
      return
    case GitHookStatus.LegacyHuskyInstalled:
      await $`npx husky-init && npm exec -- github:typicode/husky-4-to-6 --remove-v4-config`
      return
    case GitHookStatus.PrettierHookNotFound:
      await shell.addHuskyGitHook('pre-commit', 'npx pretty-quick --staged')
      return
  }
}

export async function checkGitHooks(): Promise<GitHookStatus> {
  createLogger($.logLevel).debug('\nChecking Git hooks...')

  if (!(await shell.isInsideGitRepo())) {
    return GitHookStatus.NotGitRepo
  }

  if (!(await shell.isNpmModuleInstalled('husky'))) {
    return GitHookStatus.HuskyNotInstalled
  }

  await shell.getInstalledModuleVersion('debug')
  const huskyVersion = await shell.getInstalledModuleVersion('husky')
  if (semver.satisfies(huskyVersion as string, ' >= 6.0.0')) {
    return GitHookStatus.LegacyHuskyInstalled
  }

  if (!(await shell.hasHuskyHook('pre-commit', ['prettier', 'pretty-quick']))) {
    return GitHookStatus.PrettierHookNotFound
  }

  return GitHookStatus.Good
}
