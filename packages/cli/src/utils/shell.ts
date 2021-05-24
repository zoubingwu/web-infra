import path from 'path'
import semver from 'semver'
import { DEPENDENCY_TYPE } from './constants'
import { $ } from './script'

export async function getProjectRoot(): Promise<string> {
  const { stdout: gitDir } = await $`git rev-parse --git-dir`
  const rootPath = path.join(gitDir, '..')
  return rootPath
}

export async function getPacakgeJson(dir: string) {
  try {
    const { stdout } = await $`cat ${dir}/package.json`
    return JSON.parse(stdout)
  } catch {
    throw new Error('Could not find package.json.')
  }
}

export async function getProjectRootPackgeJson() {
  const rootDir = await getProjectRoot()
  return await getPacakgeJson(rootDir)
}

export async function getCurrentDirectoryPackageJson() {
  const { stdout: cwd } = await $`pwd`
  return await getPacakgeJson(cwd.trim())
}

export async function isNpmModuleInstalled(
  moduleName: string
): Promise<boolean> {
  try {
    const packageJson = await getProjectRootPackgeJson()
    const devDep = packageJson[DEPENDENCY_TYPE.DEV] ?? {}
    const directDep = packageJson[DEPENDENCY_TYPE.DIRECT] ?? {}
    return moduleName in directDep || moduleName in devDep
  } catch {
    return false
  }
}

export async function isFileExist(fileName: string) {
  try {
    await $`test -f ${fileName}`
    return true
  } catch {
    return false
  }
}

export async function isInsideGitRepo() {
  try {
    const { stdout } = await $`git rev-parse --is-inside-work-tree`
    return stdout.trim() === 'true'
  } catch {
    return false
  }
}

export async function setNpmScript(name: string, script: string) {
  try {
    await $`npm set-script ${name} "${script}"`
  } catch {
    //TODO npm set-script requires npm v7, do fallback here
  }
}

export type HookTypes =
  | 'pre-commit'
  | 'prepare-commit-msg'
  | 'commit-msg'
  | 'post-commit'

export async function addHuskyGitHook(name: HookTypes, script: string) {
  await $`npx husky add .husky/${name} "${script}"`
}

export type ModuleInHooks = 'prettier' | 'eslint' | 'pretty-quick'

export async function hasHuskyHook(
  type: HookTypes,
  names: ModuleInHooks | ModuleInHooks[]
): Promise<boolean> {
  try {
    const rootPath = await getProjectRoot()
    const huskyPath = path.join(rootPath, '.husky', type)
    const { stdout } = await $`cat ${huskyPath.trim()}`
    const checkingModuleNames = Array.isArray(names) ? names : [names]
    return checkingModuleNames.some(name => stdout.includes(name))
  } catch {
    return false
  }
}

export async function getInstalledModuleVersion(
  name: string
): Promise<string | null> {
  try {
    const { stdout } = await $`npm list ${name} | grep ${name}`
    const versions: [string, semver.SemVer][] = stdout
      .trim()
      .split('\n')
      .map(s => s.slice(s.indexOf(name)).split('@')) // [['module1', '1.0.0'], ['module1', '2.0.0']]
      .map(([k, v]) => [k, semver.coerce(v)!])

    if (versions.length > 1) {
      versions.sort((a, b) => b[1].compare(a[1])) // put newer version on top
    }

    return versions[0][1].format()
  } catch (e) {
    return null
  }
}
