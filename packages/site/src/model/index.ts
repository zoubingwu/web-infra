import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { createLogger } from 'redux-logger'

import { globalSlice } from './globals'
import { routesSlice } from './route'

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['globals'],
}

const rootReducer = combineReducers({
  globals: globalSlice.reducer,
  routes: routesSlice.reducer,
})
const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware => {
    const middlewares = getDefaultMiddleware({
      serializableCheck: false,
    })

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

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const actions = {
  ...globalSlice.actions,
  ...routesSlice.actions,
}
