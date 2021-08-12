import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface GlobalState {
  darkMode: boolean
  route: string
}

const initialState: GlobalState = {
  darkMode:
    window?.matchMedia('(prefers-color-scheme: dark)')?.matches ?? false,
  route: '',
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
