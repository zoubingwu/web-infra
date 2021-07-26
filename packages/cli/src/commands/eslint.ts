import chalk from 'chalk'

import { createLogger } from '../utils/logger'
import * as shell from '../utils/shell'
import { createDoctorResult, Doctor } from '../utils/common'

enum EslintStatus {
  Good,
  NotNpmProject,
  EslintNotInstalled,
}

class EslintDoctor extends Doctor {
  public name = 'Eslint'

  public getDoctorResult(status: EslintStatus) {
    switch (status) {
      case EslintStatus.Good:
        return createDoctorResult('success', 'Eslint is properly installed and configured.')
      case EslintStatus.NotNpmProject:
        return createDoctorResult('error', 'Could not find package.json in current directory.')
      case EslintStatus.EslintNotInstalled:
        return createDoctorResult('error', 'Eslint is not installed.')
    }
  }

  public async fix(status: EslintStatus) {
    const logger = createLogger(shell.$.logLevel)

    switch (status) {
      case EslintStatus.Good:
        return
      case EslintStatus.NotNpmProject:
        logger.info(chalk.yellow(`Skipping...Could not find package.json in current directory.`))
        return
      case EslintStatus.EslintNotInstalled:
        // TODO install eslint and configure it
        logger.info(
          chalk.yellow(
            `Skipping...Eslint is not installed, see ${chalk.underline('https://eslint.org/docs/user-guide/getting-started')} to get started.`
          )
        )
        return
    }

    logger.info(`Eslint fixed!`)
  }

  protected getDescriptiveStatus(s: EslintStatus) {
    return EslintStatus[s]
  }

  protected async getStatus() {
    if (!(await shell.isFileExist('package.json'))) {
      return EslintStatus.NotNpmProject
    }

    if (!(await shell.isNpmModuleInstalled('eslint'))) {
      return EslintStatus.EslintNotInstalled
    }

    // TODO check eslint config

    return EslintStatus.Good
  }
}

export const eslintDoctor = new EslintDoctor()
