import fs from 'fs'
import os from 'os'
import { promisify } from 'util'

export const exists = promisify(fs.exists)
export const readFileBuffer = promisify(fs.readFile)
export const writeFile = promisify(fs.writeFile)

const CR = '\r'.charCodeAt(0)
const LF = '\n'.charCodeAt(0)

export async function getEolFromFile(path: string): Promise<string | void> {
  if (!(await exists(path))) {
    return undefined
  }

  const buffer = await readFileBuffer(path)

  for (let i = 0; i < buffer.length; ++i) {
    if (buffer[i] === CR) {
      return '\r\n'
    }
    if (buffer[i] === LF) {
      return '\n'
    }
  }
  return undefined
}

export async function writeFilePreservingEol(
  path: string,
  data: string
): Promise<void> {
  const eol = (await getEolFromFile(path)) || os.EOL
  if (eol !== '\n') {
    data = data.replace(/\n/g, eol)
  }
  await writeFile(path, data)
}
