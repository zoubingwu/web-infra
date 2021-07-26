import { cosmiconfig } from 'cosmiconfig'
import chalk from 'chalk'

import { json5, toml } from '../utils/loader'
import { createLogger } from '../utils/logger'
import * as shell from '../utils/shell'
import * as fs from '../utils/fs'
import { createDoctorResult, Doctor } from '../utils/common'
import prettierConfig from '../../../prettier-config/package.json'

enum PrettierStatus {
  Good,
  PrettierNotInstalled,
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

class PrettierDoctor extends Doctor {
  public name = 'Prettier'

  public getDoctorResult(status: PrettierStatus) {
    switch (status) {
      case PrettierStatus.Good:
        return createDoctorResult('success', 'Prettier is installed and properly configured.')
      case PrettierStatus.PrettierNotInstalled:
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
      case PrettierStatus.PrettierNotInstalled: {
        logger.info(`Installing prettier, pretty-quick and ${prettierConfig.name}...`)
        await shell.$`yarn add prettier pretty-quick ${prettierConfig.name} -D`
        const { path, json, indent } = await shell.getCurrentDirectoryPackageJson()
        json.prettier = prettierConfig.name
        logger.info(`Setting up prettier configuration...`)
        await fs.writeFilePreservingEol(path, JSON.stringify(json, null, indent) + '\n')
        break
      }
      case PrettierStatus.PrettierWronglyConfigured:
        break
      case PrettierStatus.PrettierConfigNotFound:
        logger.info(`Setting up prettier configuration...`)
        await shell.$`yarn add ${prettierConfig.name} -D`
        break
      default:
        break
    }
    logger.info(`Prettier fixed!`)
  }

  protected async getStatus() {
    const logger = createLogger(shell.$.logLevel)

    if (!(await shell.isFileExist('package.json'))) {
      return PrettierStatus.NotNpmProject
    }

    if (!(await shell.isNpmModuleInstalled('prettier'))) {
      return PrettierStatus.PrettierNotInstalled
    }

    try {
      const result = await getPrettierConfig()

      if (result) {
        logger.info(`Found Prettier configuration at ${result.filepath}`)
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
