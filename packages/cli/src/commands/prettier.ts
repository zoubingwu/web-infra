import { cosmiconfig } from 'cosmiconfig'
import { json5, toml } from '../utils/loader'
import { createLogger } from '../utils/logger'
import * as shell from '../utils/shell'
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

export function getPrettierQuickFix(status: PrettierStatus) {
  switch (status) {
    case PrettierStatus.Good:
      return () => {}
    case PrettierStatus.NotInstalled:
      return async () => {
        await shell.$`yarn add prettier pretty-quick -D`
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
  createLogger(shell.$.logLevel).debug('\nChecking Prettier configs...')

  if (!(await shell.isFileExist('package.json'))) {
    return PrettierStatus.NotNpmProject
  }

  if (!(await shell.isNpmModuleInstalled('prettier'))) {
    return PrettierStatus.NotInstalled
  }

  try {
    const result = await getPrettierConfig()

    if (result) {
      createLogger(shell.$.logLevel).debug(
        `Found your prettier configuration file at shell.${result.filepath}`
      )
      delete result.config.$schema

      //TODO compare config and find inconsistency
    }
  } catch (e) {
    createLogger(shell.$.logLevel).error(e)
  }

  return PrettierStatus.Good
}
