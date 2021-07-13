import { configureStore, Middleware, isRejectedWithValue } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { createLogger } from 'redux-logger'
import { api } from '../services/api'
import { globalSlice } from './global'
import { authSlice } from './auth'

const rtkQueryErrorLogger: Middleware = () => next => action => {
  if (isRejectedWithValue(action)) {
    let message = action.error.message
    if (action.payload?.data?.errors?.message) {
      message = `${action.payload?.data?.errors?.message}`
    }
    console.error('RTKQ error caught: ', action)
  }

  return next(action)
}

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    globals: globalSlice.reducer,
    auth: authSlice.reducer,
  },
  middleware: getDefaultMiddleware => {
    const middlewares = getDefaultMiddleware({
      serializableCheck: false,
    })

    middlewares.push(api.middleware, rtkQueryErrorLogger)

    if (import.meta.env.DEV) {
      const logger = createLogger({
        duration: true,
        collapsed: true,
      })
      middlewares.push(logger)
    }

    return middlewares
  },

  devTools: import.meta.env.DEV,
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const actions = {
  ...globalSlice.actions,
  ...authSlice.actions,
}
