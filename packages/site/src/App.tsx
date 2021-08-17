import React from 'react'
import clsx from 'clsx'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import Nav from './components/Nav'
import Page from './components/Page'
import { store, persistor, useAppSelector } from './model'

function Main() {
  const darkMode = useAppSelector(state => state.globals.darkMode)

  return (
    <div
      className={clsx(
        'min-h-100vh transition',
        darkMode ? 'dark-theme' : 'light-theme',
        darkMode ? 'bg-dark-gray4 text-white' : 'bg-light-100 text-dark-gray1'
      )}>
      <div className="flex flex-row max-w-1100px min-h-100vh m-auto">
        <Nav />
        <Page />
      </div>
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
