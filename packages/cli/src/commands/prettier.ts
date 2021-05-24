import { cosmiconfig } from 'cosmiconfig'
import { json5, toml } from '../utils/loader'
import { createLogger } from '../utils/logger'
import { $ } from '../utils/script'
import { isFileExist, isNpmModuleInstalled } from '../utils/shell'
import { createDoctorResult, DoctorResult } from '../utils/common'

export enum PrettierStatus {
  Good,
  NotInstalled,
  WronglyConfigured,
  NotNpmProject,
}

export function getDescriptivePrettierResult(
  status: PrettierStatus
): DoctorResult {
  switch (status) {
    case PrettierStatus.Good:
      return createDoctorResult(
        'success',
        'Prettier is installed and properly configured.'
      )
    case PrettierStatus.NotInstalled:
      return createDoctorResult('error', 'Prettier is not installed')
    case PrettierStatus.NotNpmProject:
      return createDoctorResult(
        'error',
        'Could not find package.json in current directory.'
      )
    case PrettierStatus.WronglyConfigured:
      return createDoctorResult(
        'error',
        'Prettier is installed but not properly configured.'
      )
  }
}

export function getPrettierQuickFixByStatus(status: PrettierStatus) {
  switch (status) {
    case PrettierStatus.Good:
      return () => {}
    case PrettierStatus.NotInstalled:
      return async () => {
        await $`yarn add prettier pretty-quick -D`
      }
    case PrettierStatus.NotNpmProject:
      return () => {}
    case PrettierStatus.WronglyConfigured:
      return () => {}
  }
}

export async function getPrettierConfig() {
  const explorer = cosmiconfig('prettier', {
    searchPlaces: [
      'package.json',
      '.prettierrc',
      '.prettierrc.json',
      '.prettierrc.yaml',
      '.prettierrc.yml',
      '.prettierrc.json5',
      '.prettierrc.js',
      '.prettierrc.cjs',
      'prettier.config.js',
      'prettier.config.cjs',
      '.prettierrc.toml',
    ],
    loaders: {
      '.toml': toml,
      '.json5': json5,
    },
  })

  return await explorer.search()
}

export async function checkPrettier(): Promise<PrettierStatus> {
  createLogger($.logLevel).debug('\nChecking Prettier configs...')

  if (!(await isFileExist('package.json'))) {
    return PrettierStatus.NotNpmProject
  }

  if (!(await isNpmModuleInstalled('prettier'))) {
    return PrettierStatus.NotInstalled
  }

  try {
    const result = await getPrettierConfig()

    if (result) {
      createLogger($.logLevel).debug(
        `Found your prettier configuration file at ${result.filepath}`
      )
      delete result.config.$schema

      //TODO compare config and find inconsistency
    }
  } catch (e) {
    createLogger($.logLevel).error(e)
  }

  return PrettierStatus.Good
}
