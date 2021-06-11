#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const execSync = require('child_process').execSync
const argv = require('minimist')(process.argv.slice(2))
const { cyan, blue, yellow, green } = require('chalk')
const prompts = require('prompts')

const cwd = process.cwd()

const FRAMEWORKS = [
  {
    name: 'react',
    color: cyan,
    variants: [
      {
        name: 'react-ts',
        display: 'TypeScript',
        color: blue,
      },
      {
        name: 'react-ts-vite',
        display: 'TypeScript',
        color: yellow,
      },
    ],
  },
]

const TEMPLATES = FRAMEWORKS.map(
  f => (f.variants && f.variants.map(v => v.name)) || [f.name]
).reduce((a, b) => a.concat(b), [])

const renameFiles = {
  _gitignore: '.gitignore',
}

function copy(src, dest) {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    copyDir(src, dest)
  } else {
    fs.copyFileSync(src, dest)
  }
}

function isValidPackageName(projectName) {
  return /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(
    projectName
  )
}

function toValidPackageName(projectName) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[^a-z0-9-~]+/g, '-')
}

function copyDir(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true })
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file)
    const destFile = path.resolve(destDir, file)
    copy(srcFile, destFile)
  }
}

function emptyDir(dir) {
  if (!fs.existsSync(dir)) {
    return
  }
  for (const file of fs.readdirSync(dir)) {
    const abs = path.resolve(dir, file)
    // baseline is Node 12 so can't use rmSync :(
    if (fs.lstatSync(abs).isDirectory()) {
      emptyDir(abs)
      fs.rmdirSync(abs)
    } else {
      fs.unlinkSync(abs)
    }
  }
}

function isEmpty(path) {
  return fs.readdirSync(path).length === 0
}

function isInGitRepository(cwd) {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore', cwd })
    return true
  } catch (e) {
    return false
  }
}

function tryGitInit(cwd) {
  try {
    execSync('git --version', { stdio: 'ignore', cwd })
    if (isInGitRepository(cwd)) {
      return false
    }

    execSync('git init', { stdio: 'ignore', cwd })
    return true
  } catch (e) {
    console.warn('Git repo not initialized', e)
    return false
  }
}

;(async function () {
  let targetDir = argv._[0]
  let template = argv.template || argv.t

  const defaultProjectName = !targetDir ? 'my-project' : targetDir
  let result

  try {
    result = await prompts(
      [
        {
          type: targetDir ? null : 'text',
          name: 'projectName',
          message: 'Project name:',
          initial: defaultProjectName,
          onState: state =>
            (targetDir = state.value.trim() || defaultProjectName),
        },

        {
          type: () =>
            !fs.existsSync(targetDir) || isEmpty(targetDir) ? null : 'confirm',
          name: 'overwrite',
          message: () =>
            (targetDir === '.'
              ? 'Current directory'
              : `Target directory "${targetDir}"`) +
            ` is not empty. Remove existing files and continue?`,
        },

        {
          type: (_, { overwrite } = {}) => {
            if (overwrite == false) {
              throw new Error(red('✖') + ' Operation cancelled')
            }
            return null
          },
          name: 'overwriteChecker',
        },

        {
          type: () => (isValidPackageName(targetDir) ? null : 'text'),
          name: 'packageName',
          message: 'Package name:',
          initial: () => toValidPackageName(targetDir),
          validate: dir =>
            isValidPackageName(dir) || 'Invalid package.json name',
        },

        {
          type: template && TEMPLATES.includes(template) ? null : 'select',
          name: 'framework',
          message:
            template && !TEMPLATES.includes(template)
              ? `"${template}" isn't a valid template. Please choose from below: `
              : 'Select a framework:',
          initial: 0,
          choices: FRAMEWORKS.map(framework => {
            const frameworkColor = framework.color
            return {
              title: frameworkColor(framework.name),
              value: framework,
            }
          }),
        },

        {
          type: framework =>
            framework && framework.variants ? 'select' : null,
          name: 'variant',
          message: 'Select a variant:',
          // @ts-ignore
          choices: framework =>
            framework.variants.map(variant => {
              const variantColor = variant.color
              return {
                title: variantColor(variant.name),
                value: variant.name,
              }
            }),
        },
      ],

      {
        onCancel: () => {
          throw new Error(red('✖') + ' Operation cancelled')
        },
      }
    )
  } catch (e) {
    console.log(cancelled.message)
    return
  }

  const { framework, overwrite, packageName, variant } = result
  const root = path.join(cwd, targetDir)
  template = variant || framework || template

  if (overwrite) {
    emptyDir(root)
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root)
  }

  console.log(`\nScaffolding project in ${green(root)}...`)

  const templateDir = path.join(__dirname, `template-${template}`)

  const write = (file, content) => {
    const targetPath = renameFiles[file]
      ? path.join(root, renameFiles[file])
      : path.join(root, file)
    if (content) {
      fs.writeFileSync(targetPath, content)
    } else {
      copy(path.join(templateDir, file), targetPath)
    }
  }

  const files = fs.readdirSync(templateDir)
  for (const file of files.filter(f => f !== 'package.json')) {
    write(file)
  }

  const pkg = require(path.join(templateDir, `package.json`))

  pkg.name = packageName

  write('package.json', JSON.stringify(pkg, null, 2))

  if (tryGitInit(targetDir)) {
    console.log(`Initialized a git repository`)
  }

  console.log(`\nDone. You can run following commands to start:\n`)
  if (root !== cwd) {
    console.log(`  cd ${path.relative(cwd, root)}`)
  }
  console.log(`  yarn`)
  console.log(`  yarn start`)
  console.log()
})()
