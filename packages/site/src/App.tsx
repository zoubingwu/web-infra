import React from 'react'

import Nav from './components/Nav'
import Page from './components/Page'

function App() {
  return (
    <div className="flex flex-row max-w-1100px min-h-100vh m-auto">
      <Nav />
      <Page />
    </div>
  )
}

export default App
