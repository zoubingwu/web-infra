import chalk from 'chalk'
import prompts from 'prompts'
import { createLogger } from '../utils/logger'
import * as shell from '../utils/shell'

export interface ReviewOptions {
  clean: boolean
}

export async function review(pr: string, options: ReviewOptions) {
  if (options.clean) {
    await cleanPullRequest(pr)
    return
  }

  await fetchPullRequest(pr)
}

function isNumeric(value: string) {
  return /^-?\d+$/.test(value)
}

async function cleanPullRequest(pr: string) {
  const logger = createLogger(shell.$.logLevel)
  if (isNumeric(pr)) {
    const prNumber = parseInt(pr)
    const prBranch = `pr/${prNumber}`
    const mainBranch = await getMainBranch()

    logger.info(`Resetting HEAD to ${prBranch}_top...`)
    await shell.$`git reset ${prBranch}_top`
    logger.info(`Checkout to ${mainBranch} branch...`)
    await shell.$`git checkout ${mainBranch}`
    logger.info(`Deleting all pr related branches...`)
    await shell.$`git branch | grep "${prBranch}" | xargs git branch -D`
    logger.info(`Clean done!`)
  }
}

async function fetchPullRequest(pr: string) {
  const logger = createLogger(shell.$.logLevel)
  if (!isNumeric(pr)) {
    logger.error('Unexpected pr number. exiting...')
    process.exit(1)
  }
  const remotes = await getRemotes()
  const selectedRemote = await getSelectedRemote(remotes)

  const prNumber = parseInt(pr)
  const prBranch = `pr/${prNumber}`
  const prBranchBase = `${prBranch}_base`
  const prBranchTop = `${prBranch}_top`
  const colorizedPrNumber = chalk.cyan(`#${prNumber}`)
  const colorizedPrBranch = chalk.yellow(prBranch)

  logger.info(`Checking local changes...`)
  try {
    await shell.$`git diff-index --quiet HEAD --`
  } catch {
    logger.info('Local change detected. exiting...')
    logger.info('Please run `git stash` or `git commit` to save your changes.')
    process.exit(1)
  }

  const mainBranch = await getMainBranch()

  logger.info(`Fetching latest change of ${selectedRemote}/${mainBranch}...`)
  await shell.$`git fetch ${selectedRemote} ${mainBranch}`

  const latestCommitOnMaster = (
    await shell.$`git rev-parse ${selectedRemote}/${mainBranch}`
  ).stdout.trim()

  logger.info(`Cleaning local ${colorizedPrBranch} branch...`)
  let hasLocalPrBranch = false
  try {
    await shell.$`git branch | grep "${prBranch}"`
    hasLocalPrBranch = true
  } catch {}

  if (hasLocalPrBranch) {
    logger.info(`Found branches related to ${colorizedPrNumber}, deleting...`)
    shell.$`git branch | grep "${prBranch}" | xargs git branch -D`
  } else {
    logger.info(
      `Skipping, ${colorizedPrBranch} branch was not found, now fetch from remote.`
    )
  }

  logger.info(
    `Fetching pull request ${colorizedPrNumber} into branch range: ${chalk.yellow(
      prBranchBase
    )}..${chalk.yellow(prBranchTop)}`
  )
  await shell.$`git fetch -f ${remotes[selectedRemote]} pull/${prNumber}/head:${prBranchTop}`
  await shell.$`git checkout ${prBranchTop}`

  const latestCommitOnPr = (await shell.$`git rev-parse HEAD`).stdout.trim()

  logger.info(`Counting commit for #${prNumber}...`)
  const commitCount = parseInt(
    (
      await shell.$`git log ${latestCommitOnMaster}..${latestCommitOnPr} --pretty=oneline | wc -l`
    ).stdout
  )

  await shell.$`git branch -f ${prBranchBase} ${prBranchTop}~${commitCount}`

  logger.info(
    `Found ${chalk.green(commitCount)} ${
      commitCount === 1 ? 'commit' : 'commit'
    } for #${prNumber}:`
  )
  const logs = (
    await shell.$`git log --oneline --color ${prBranch}_base..${prBranch}_top`
  ).stdout
  logger.info('')
  logger.info(logs.trim())
  logger.info('')

  await shell.$`git checkout --force -b ${prBranch} ${prBranchTop}`
  logger.info('Reset HEAD to pr base, all changed files show up as unstaged.')
  await shell.$`git reset ${prBranchBase}`
  logger.info(
    'You can start review now! Stage reviewed files to track your review progress.'
  )
}

async function getRemotes() {
  const remoteOutput = (await shell.$`git remote -v`).stdout
  const remotes = remoteOutput.split('\n').reduce((acc, next) => {
    const [remoteName, remoteUrl] = next.split('\t')
    if (remoteName) {
      acc[remoteName] = remoteUrl.split(' ')[0]
    }
    return acc
  }, {} as Record<string, string>)

  return remotes
}

async function getSelectedRemote(
  remotes: Record<string, string>
): Promise<string> {
  const keys = Object.keys(remotes)
  if (keys.length === 1) {
    return keys[0]
  }

  const result = await prompts({
    type: 'select',
    name: 'selectedRemote',
    message: 'Select your remote repository.',
    choices: keys.map(name => {
      const title = `${name.padEnd(Math.max(...keys.map(n => n.length)))}: ${
        remotes[name]
      }`
      return { title, value: name }
    }),
  })

  return result.selectedRemote
}

async function getMainBranch() {
  let mainBranch = 'master'
  try {
    await shell.$`git rev-parse --verify --quiet ${mainBranch}`
  } catch {
    mainBranch = 'main'
  }

  return mainBranch
}
