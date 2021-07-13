import { createSlice } from '@reduxjs/toolkit'

interface GlobalState {
  darkMode: boolean
}

const initialState: GlobalState = {
  darkMode: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
}

export const globalSlice = createSlice({
  name: 'globals',
  initialState,
  reducers: {
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode
    },
  },
})
