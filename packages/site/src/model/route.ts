import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { modules } from '../docs'

interface RouteState {
  route: string
}

const hash = window.location.hash.slice(1)

const initialState: RouteState = {
  route: decodeURIComponent(hash) || Object.keys(modules)[0],
}

export const routesSlice = createSlice({
  name: 'routes',
  initialState,
  reducers: {
    setRoute(state, action: PayloadAction<string>) {
      state.route = action.payload
    },
  },
})
