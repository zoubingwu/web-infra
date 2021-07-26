import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { getLocalAuthInfo } from '../utils/storage'

interface AuthState {
  isAuthenticated: boolean
  currentUser?: CurrentUser
  token?: string
}

export interface CurrentUser {
  avatar: string
  email: string
  id: number
  name: string
}

export interface AuthInfo {
  user: CurrentUser
  token: string
}

const localAuthInfo = getLocalAuthInfo()

const initialState: AuthState = {
  isAuthenticated: localAuthInfo !== null,
  currentUser: localAuthInfo?.user,
  token: localAuthInfo?.token,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<boolean>) {
      state.isAuthenticated = action.payload
    },

    setAuthInfo(state, action: PayloadAction<{ user: CurrentUser; token: string }>) {
      state.currentUser = action.payload.user
      state.isAuthenticated = true
      state.token = action.payload.token
    },
  },
})
