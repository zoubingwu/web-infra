import { $ } from './script'

export async function isNpmModuleInstalled(moduleName: string) {
  return (await $`cat \`pwd\`/package.json | grep \"${moduleName}\"`).code === 0
}

export async function isFileExist(fileName: string) {
  return (await $`test -f ${fileName}`).code === 0
}

export async function isCurrentDirectoryGitRepo() {
  return (await $`git rev-parse --is-inside-work-tree`).stdout === 'true'
}
