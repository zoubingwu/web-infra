import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { modules } from '../docs'

interface GlobalState {
  darkMode: boolean
  route: string
}

const hash = window.location.hash.slice(1)

const initialState: GlobalState = {
  darkMode:
    window?.matchMedia('(prefers-color-scheme: dark)')?.matches ?? false,
  route: hash && modules[hash] ? hash : 'web infra',
}

export const globalSlice = createSlice({
  name: 'globals',
  initialState,
  reducers: {
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode
    },

    setRoute(state, action: PayloadAction<string>) {
      state.route = action.payload
    },
  },
})
