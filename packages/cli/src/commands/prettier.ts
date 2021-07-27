import chalk from 'chalk'
import { cosmiconfig } from 'cosmiconfig'

import { json5, toml } from '../utils/loader'
import { createLogger } from '../utils/logger'
import * as shell from '../utils/shell'
import * as fs from '../utils/fs'
import { assertUnreachable, createDoctorResult, Doctor } from '../utils/common'
import prettierConfig from '../../../prettier-config/package.json'

enum PrettierStatus {
  Good,
  NotInstalled,
  PrettierWronglyConfigured,
  PrettierConfigNotFound,
  NotNpmProject,
}

async function getPrettierConfig() {
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

const defaultPrettierConfig = `module.exports = {
  ...require('@ti-fe/prettier-config'),
  // extend your prettier configuration here
}
`

class PrettierDoctor extends Doctor {
  public name = 'Prettier'

  public getDoctorResult(status: PrettierStatus) {
    switch (status) {
      case PrettierStatus.Good:
        return createDoctorResult('success', 'Prettier is installed and properly configured.')
      case PrettierStatus.NotInstalled:
        return createDoctorResult('error', 'Prettier is not installed')
      case PrettierStatus.NotNpmProject:
        return createDoctorResult('error', 'Could not find package.json in current directory.')
      case PrettierStatus.PrettierWronglyConfigured:
        return createDoctorResult('error', 'Prettier is installed but not properly configured.')
      case PrettierStatus.PrettierConfigNotFound:
        return createDoctorResult('error', 'Prettier is installed but could not find configs.')
    }
  }

  public async fix(status: PrettierStatus) {
    const logger = createLogger(shell.$.logLevel)
    switch (status) {
      case PrettierStatus.Good:
        return
      case PrettierStatus.NotNpmProject:
        logger.info(chalk.yellow(`Skipping...Could not find package.json in current directory.`))
        return
      case PrettierStatus.NotInstalled: {
        logger.info(`Installing prettier...`)
        await shell.$`yarn add prettier -D`
      }
      // eslint-disable-next-line no-fallthrough
      case PrettierStatus.PrettierConfigNotFound: {
        logger.info(`Setting up prettier configuration...`)
        await shell.$`yarn add ${prettierConfig.name} -D`
        await fs.writeFilePreservingEol(`${process.cwd()}/.prettierrc.js`, defaultPrettierConfig)
        logger.info(`Prettier fixed!`)
        return
      }
      case PrettierStatus.PrettierWronglyConfigured:
        return
    }

    return assertUnreachable(status)
  }

  protected async getStatus() {
    const logger = createLogger(shell.$.logLevel)

    if (!(await shell.isFileExist('package.json'))) {
      return PrettierStatus.NotNpmProject
    }

    if (!(await shell.isNpmModuleInstalled('prettier'))) {
      return PrettierStatus.NotInstalled
    }

    try {
      const result = await getPrettierConfig()

      if (result) {
        logger.info(`Found prettier configuration at ${result.filepath}`)
        delete result.config.$schema

        // TODO compare config and find inconsistency
      }
    } catch (e) {
      logger.error(e)
      return PrettierStatus.PrettierConfigNotFound
    }

    return PrettierStatus.Good
  }

  protected getDescriptiveStatus(status: PrettierStatus) {
    return PrettierStatus[status]
  }
}

export const prettierDoctor = new PrettierDoctor()
