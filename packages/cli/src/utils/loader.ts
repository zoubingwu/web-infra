import JSON5 from 'json5'
import { parse as tomlParse } from '@iarna/toml'

export function json5(filePath: string, content: string) {
  try {
    return JSON5.parse(content)
  } catch (error) {
    error.message = `JSON5 Error in ${filePath}:\n${error.message}`
    throw error
  }
}

export function toml(filePath: string, content: string) {
  try {
    return tomlParse(content)
  } catch (error) {
    error.message = `TOML Error in ${filePath}:\n${error.message}`
    throw error
  }
}
