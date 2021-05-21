import { $ } from '../utils/script'
import { DoctorResult } from './doctor'

export async function checkPrettier(): Promise<DoctorResult> {
  const res = await isPrettierInstalled()

  if (!res) {
    return {
      type: 'error',
      result: 'Prettier is not installed.',
    }
  }

  return {
    type: 'success',
    result: 'Prettier is installed and properly configured.',
  }
}

export async function isPrettierInstalled() {
  try {
    await $`cat \`pwd\`/package.json | grep \"prettier\"`

    return true
  } catch {
    return false
  }
}
