import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

import { VFile } from 'vfile'
import { visit } from 'unist-util-visit'
import matter from 'gray-matter'
import mdx from '@mdx-js/mdx'

const filename = fileURLToPath(import.meta.url)
const SITE_ROOT = path.resolve(path.dirname(filename), '..')
const SRC_DIR = path.resolve(SITE_ROOT, './src')
const DOCS_DIR = path.resolve(SRC_DIR, './docs')
const DOCS_ENTRY = fs.readdirSync(DOCS_DIR)
const docsData = {
  nav: [],
}

DOCS_ENTRY.forEach(doc => {
  const { content } = matter.read(path.resolve(DOCS_DIR, doc))
  const title = path.basename(doc, '.mdx')
  const item = {
    title: title.toUpperCase(),
    children: [],
    level: 0,
    route: toRoute(title.toLowerCase()),
  }

  const { children } = item
  const file = new VFile(content)
  const extractTitle = () => tree =>
    visit(tree, 'heading', node => {
      if (node.depth > 2) return

      const value = node.children[0].value

      // ignore heading 1
      if (node.depth === 2) {
        const parentTitle = findParentTitle(children, node.depth - 1)
        if (parentTitle) {
          children.push(
            createItem(value, node.depth, parentTitle + '.' + toRoute(value))
          )
        } else {
          children.push(createItem(value, node.depth, toRoute(value)))
        }
      }
    })

  const mdxCompiler = mdx.createCompiler({
    remarkPlugins: [extractTitle],
  })

  mdxCompiler.processSync(file)
  docsData.nav.push(item)
})

function findParentTitle(titles, level) {
  for (let i = titles.length; i--; i >= 0) {
    if (titles[i].level === level) {
      return titles[i].route
    }
  }
  return null
}

function createItem(title, level, route) {
  return {
    title,
    level,
    route,
  }
}

function toRoute(val) {
  return val.toLowerCase().split(' ').join('-')
}

fs.writeFileSync(
  path.resolve(SRC_DIR, './docs.generated.json'),
  JSON.stringify(docsData, null, 2)
)
console.log('docs json generated!')
