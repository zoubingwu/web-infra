import React from 'react'
import clsx from 'clsx'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import Nav from './components/Nav'
import Page from './components/Page'
import { store, persistor, useAppSelector } from './model'

function Main() {
  const dark = useAppSelector(state => state.globals.darkMode)
  return (
    <div
      className={clsx(
        'flex flex-row max-w-1100px min-h-100vh m-auto',
        dark ? 'dark-theme' : 'light-theme'
      )}>
      <Nav />
      <Page />
    </div>
  )
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Main />
      </PersistGate>
    </Provider>
  )
}

export default App
