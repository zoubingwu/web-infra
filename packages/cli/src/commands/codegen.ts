import fs from 'fs'
import path from 'path'
import os from 'os'

import * as ts from 'typescript'

import * as shell from '../utils/shell'

export interface CodegenOptions {
  schema?: string
  group?: string
  output?: string
}

const defaultModelFile = 'index'

export async function codegen(options: CodegenOptions) {
  if (!options.schema) {
    throw new Error('Schema file is required!')
  }

  const schemaAbsPath = path.resolve(process.cwd(), options.schema)
  const { stdout: code } =
    await shell.$`npx @rtk-incubator/rtk-query-codegen-openapi ${schemaAbsPath}`

  const sourceFile = ts.createSourceFile('api.ts', code, ts.ScriptTarget.ESNext)
  const models = options.group
    ? options.group.split(',').map(i => i.toLowerCase())
    : []

  traverse(sourceFile, models, options.output)
}

function traverse(
  sourceFile: ts.SourceFile,
  models: string[],
  outDir?: string
) {
  const typeDefinitionsMap = new Map<string, ts.Node[]>()
  const streamMap = new Map<string, fs.WriteStream>()

  models.concat(defaultModelFile).forEach(i => {
    const dir = path.resolve(process.cwd(), outDir ?? '.')
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
    const filePath = path.resolve(dir, `${i}.ts`)
    streamMap.set(i, fs.createWriteStream(filePath))
    typeDefinitionsMap.set(i, [] as ts.Node[])
  })

  traverseNode(sourceFile)

  function traverseNode(node: ts.Node) {
    if (ts.isTypeAliasDeclaration(node)) {
      const name = node.name.escapedText
      const target = models.find(m => name.toString().toLowerCase().includes(m))
      let s = typeDefinitionsMap.get(defaultModelFile)!
      if (target) {
        s = typeDefinitionsMap.get(target)!
      }
      s.push(node)
    }

    ts.forEachChild(node, traverseNode)
  }

  typeDefinitionsMap.forEach((v, k) => {
    if (v.length > 0) {
      // TODO search and import other declaration
      print(streamMap.get(k)!, v)
    }
  })

  streamMap.forEach(i => i.close())
  streamMap.clear()
  typeDefinitionsMap.clear()
}

function createImportDeclaration(importSpecifier: string, pathString: string) {
  const { factory } = ts
  return factory.createImportDeclaration(
    undefined,
    undefined,
    factory.createImportClause(
      true,
      undefined,
      factory.createNamedImports([
        factory.createImportSpecifier(
          undefined,
          factory.createIdentifier(importSpecifier)
        ),
      ])
    ),
    factory.createStringLiteral(pathString)
  )
}

function print(stream: fs.WriteStream, nodes: ts.Node[]) {
  const printer = ts.createPrinter({
    newLine:
      os.EOL === '\n'
        ? ts.NewLineKind.LineFeed
        : ts.NewLineKind.CarriageReturnLineFeed,
  })

  const resultFile = ts.createSourceFile(
    '.temp.ts',
    '',
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS
  )

  nodes.forEach(n => {
    stream.write(printer.printNode(ts.EmitHint.Unspecified, n, resultFile))
    stream.write('\n\n')
  })
}
