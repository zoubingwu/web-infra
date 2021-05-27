#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const argv = require('minimist')(process.argv.slice(2))
const { prompt } = require('enquirer')
const { cyan, blue } = require('chalk')

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

async function getValidPackageName(projectName) {
  const packageNameRegExp =
    /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/
  if (packageNameRegExp.test(projectName)) {
    return projectName
  } else {
    const suggestedPackageName = projectName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/^[._]/, '')
      .replace(/[^a-z0-9-~]+/g, '-')

    /**
     * @type {{ inputPackageName: string }}
     */
    const { inputPackageName } = await prompt({
      type: 'input',
      name: 'inputPackageName',
      message: `Package name:`,
      initial: suggestedPackageName,
      validate: input =>
        packageNameRegExp.test(input) ? true : 'Invalid package.json name',
    })
    return inputPackageName
  }
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

;(async function () {
  let targetDir = argv._[0]
  if (!targetDir) {
    const { projectName } = await prompt({
      type: 'input',
      name: 'projectName',
      message: `Project name:`,
      initial: 'my-project',
    })
    targetDir = projectName
  }
  const packageName = await getValidPackageName(targetDir)
  const root = path.join(cwd, targetDir)

  if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true })
  } else {
    const existing = fs.readdirSync(root)
    if (existing.length) {
      /**
       * @type {{ yes: boolean }}
       */
      const { yes } = await prompt({
        type: 'confirm',
        name: 'yes',
        initial: 'Y',
        message:
          (targetDir === '.'
            ? 'Current directory'
            : `Target directory ${targetDir}`) +
          ' is not empty.\n' +
          'Remove existing files and continue?',
      })
      if (yes) {
        emptyDir(root)
      } else {
        return
      }
    }
  }

  let template = argv.t || argv.template
  let message = 'Select a framework:'
  let isValidTemplate = false

  if (typeof template === 'string') {
    isValidTemplate = TEMPLATES.includes(template)
    message = `${template} isn't a valid template. Please choose from below:`
  }

  if (!template || !isValidTemplate) {
    template = 'react-ts'
  }

  console.log(`\nScaffolding project in ${root}...`)

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

  console.log(`\nDone. You can run following commands to start:\n`)
  if (root !== cwd) {
    console.log(`  cd ${path.relative(cwd, root)}`)
  }
  console.log(`  yarn && yarn prepare`)
  console.log(`  yarn start`)
  console.log()
})()
