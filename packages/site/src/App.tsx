import React from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import Nav from './components/Nav'
import Page from './components/Page'
import { store, persistor } from './model'

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <div className="flex flex-row max-w-1100px min-h-100vh m-auto">
          <Nav />
          <Page />
        </div>
      </PersistGate>
    </Provider>
  )
}

export default App
