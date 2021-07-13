import type { AuthInfo } from '../models/auth'

export function getLocalAuthInfo(): AuthInfo | null {
  const persistedUser = localStorage.getItem('__user')
  const persistedToken = localStorage.getItem('__token')

  if (!persistedUser || !persistedToken) {
    return null
  }

  return {
    user: JSON.parse(persistedUser),
    token: persistedToken,
  }
}

export function saveAuthInfo(info: AuthInfo) {
  localStorage.setItem('__user', JSON.stringify(info.user))
  localStorage.setItem('__token', info.token)
}
