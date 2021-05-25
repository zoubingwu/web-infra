import { cosmiconfig } from 'cosmiconfig'
import { json5, toml } from '../utils/loader'
import { createLogger } from '../utils/logger'
import * as shell from '../utils/shell'
import * as fs from '../utils/fs'
import { createDoctorResult, DoctorResult } from '../utils/common'

export enum Status {
  Good,
  PrettierNotInstalled,
  PrettierWronglyConfigured,
  NotNpmProject,
}

export function getResult(status: Status): DoctorResult {
  switch (status) {
    case Status.Good:
      return createDoctorResult(
        'success',
        'Prettier is installed and properly configured.'
      )
    case Status.PrettierNotInstalled:
      return createDoctorResult('error', 'Prettier is not installed')
    case Status.NotNpmProject:
      return createDoctorResult(
        'error',
        'Could not find package.json in current directory.'
      )
    case Status.PrettierWronglyConfigured:
      return createDoctorResult(
        'error',
        'Prettier is installed but not properly configured.'
      )
  }
}

export async function fix(status: Status) {
  switch (status) {
    case Status.Good:
      return
    case Status.NotNpmProject:
      return
    case Status.PrettierNotInstalled:
      await shell.$`yarn add prettier pretty-quick -D`
      const { path, json, indent } =
        await shell.getCurrentDirectoryPackageJson()
      json.prettier = '@pingcap/prettier-config'
      fs.writeFilePreservingEol(path, JSON.stringify(json, null, indent) + '\n')
      return
    case Status.PrettierWronglyConfigured:
      return
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

export async function check(): Promise<Status> {
  const logger = createLogger(shell.$.logLevel)
  logger.info(`Checking Prettier status...`)

  if (!(await shell.isFileExist('package.json'))) {
    return Status.NotNpmProject
  }

  if (!(await shell.isNpmModuleInstalled('prettier'))) {
    return Status.PrettierNotInstalled
  }

  try {
    const result = await getPrettierConfig()

    if (result) {
      logger.info(`Found Prettier configuration at ${result.filepath}`)
      delete result.config.$schema

      //TODO compare config and find inconsistency
    }
  } catch (e) {
    logger.error(e)
  }

  return Status.Good
}
