import fs from 'fs'
import os from 'os'
import { promisify } from 'util'

export const exists = promisify(fs.exists)
export const readFileBuffer = promisify(fs.readFile)
export const writeFile = promisify(fs.writeFile)

const CR = '\r'.charCodeAt(0)
const LF = '\n'.charCodeAt(0)

export async function getEolFromFile(path: string): Promise<string | undefined> {
  if (!(await exists(path))) {
    return
  }

  const buffer = await readFileBuffer(path)

  for (const char of buffer) {
    if (char === CR) {
      return '\r\n'
    }
    if (char === LF) {
      return '\n'
    }
  }

  return
}

export async function writeFilePreservingEol(path: string, data: string): Promise<void> {
  let content = data
  const eol = (await getEolFromFile(path)) || os.EOL
  if (eol !== '\n') {
    content = data.replace(/\n/g, eol)
  }
  await writeFile(path, content)
}
