import { Provider } from 'react-redux'
import { store } from './models'
import Layout from './layout'

function App() {
  return (
    <Provider store={store}>
      <Layout />
    </Provider>
  )
}

export default App
