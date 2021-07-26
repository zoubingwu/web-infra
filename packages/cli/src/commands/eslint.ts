import chalk from 'chalk'
import { cosmiconfig } from 'cosmiconfig'

import { createLogger } from '../utils/logger'
import * as shell from '../utils/shell'
import * as fs from '../utils/fs'
import { assertUnreachable, createDoctorResult, Doctor } from '../utils/common'

enum EslintStatus {
  Good,
  NotNpmProject,
  NotInstalled,
  ConfigNotFound,
  ConfigNotConsistent,
}

const defaultEslintConfig = `module.exports = {
  extends: ['@ti-fe/eslint-config'],
  env: {
    // Your custom env variables, e.g., browser: true, jest: true
  },
  globals: {
    // Your global variables
  },
  rules: {
    // Your custom rules.
  },
}
`

async function getEslintConfig() {
  const explorer = cosmiconfig('eslint', {
    searchPlaces: ['package.json', '.eslintrc.js', '.eslintrc.cjs', '.eslintrc.yaml', '.eslintrc.yml', '.eslintrc.json'],
    packageProp: ['eslintConfig'],
  })

  return await explorer.search()
}

class EslintDoctor extends Doctor {
  public name = 'Eslint'

  public getDoctorResult(status: EslintStatus) {
    switch (status) {
      case EslintStatus.Good:
        return createDoctorResult('success', 'Eslint is properly installed and configured.')
      case EslintStatus.NotNpmProject:
        return createDoctorResult('error', 'Could not find package.json in current directory.')
      case EslintStatus.NotInstalled:
        return createDoctorResult('error', 'Eslint is not installed.')
      case EslintStatus.ConfigNotFound:
        return createDoctorResult('error', 'Eslint config is not found.')
      case EslintStatus.ConfigNotConsistent:
        return createDoctorResult('warn', 'Eslint config is not consistent.')
    }

    return assertUnreachable(status)
  }

  public async fix(status: EslintStatus) {
    const logger = createLogger(shell.$.logLevel)

    switch (status) {
      case EslintStatus.Good:
        return
      case EslintStatus.NotNpmProject:
        logger.info(chalk.yellow(`Skipping...Could not find package.json in current directory.`))
        return
      case EslintStatus.NotInstalled: {
        logger.info(`Installing eslint related dependencies...`)
        await shell.$`yarn add -D eslint typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin @ti-fe/eslint-config`
      }
      // eslint-disable-next-line no-fallthrough
      case EslintStatus.ConfigNotFound: {
        logger.info(`Setting up eslint configuration...`)
        await fs.writeFilePreservingEol(`${process.cwd()}/.eslintrc.js`, defaultEslintConfig)
        logger.info(`Eslint fixed!`)
        return
      }
      case EslintStatus.ConfigNotConsistent:
        logger.info(chalk.yellow(`Skipping...Current config is not consistent with @ti-fe/eslint-config, try install it manually.`))
        return
    }

    return assertUnreachable(status)
  }

  protected getDescriptiveStatus(s: EslintStatus) {
    return EslintStatus[s]
  }

  protected async getStatus() {
    const logger = createLogger(shell.$.logLevel)

    if (!(await shell.isFileExist('package.json'))) {
      return EslintStatus.NotNpmProject
    }

    if (!(await shell.isNpmModuleInstalled('eslint'))) {
      return EslintStatus.NotInstalled
    }

    try {
      const result = await getEslintConfig()

      if (result) {
        logger.info(`Found eslint configuration at ${result.filepath}`)
        delete result.config.$schema

        if (!JSON.stringify(result.config).includes('@ti-fe/eslint-config')) {
          return EslintStatus.ConfigNotConsistent
        }
      }
    } catch (e) {
      logger.error(e)
      return EslintStatus.ConfigNotFound
    }

    return EslintStatus.Good
  }
}

export const eslintDoctor = new EslintDoctor()
