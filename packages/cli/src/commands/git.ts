import { $ } from '../utils/script'
import { createLogger } from '../utils/logger'
import { isNpmModuleInstalled } from '../utils/shell'

export enum GitHookStatus {
  HuskyNotInstalled,
}

export async function addPreCommitHook(cmd: string) {
  await $`npx husky add .husky/pre-commit "${cmd}"`
}

export async function checkGitHooks() {
  createLogger($.logLevel).debug('Checking Git hooks...')

  if (!(await isNpmModuleInstalled('husky'))) {
  }
}
