import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Switch, Route, Redirect, RouteProps } from 'react-router-dom'
import { Spin } from 'antd'
import { useAppSelector } from '../models'

const HomePage = lazy(() => import('../pages/HomePage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))

const PrivateRoute: React.FC<{ component: React.ComponentType } & RouteProps> = ({ component: Component, ...rest }) => {
  const isAuthed = useAppSelector(state => state.auth.isAuthenticated)
  return (
    <Route
      {...rest}
      render={props =>
        isAuthed ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: props.location },
            }}
          />
        )
      }
    />
  )
}

const Layout = () => {
  return (
    <Router basename="dashboard">
      <Suspense fallback={null}>
        <Switch>
          <Route path="/login" component={LoginPage} />
          <div>
            <div>
              <Suspense fallback={<Spin />}>
                <Switch>
                  <PrivateRoute path="/" component={HomePage} exact />
                </Switch>
              </Suspense>
            </div>
          </div>
        </Switch>
      </Suspense>
    </Router>
  )
}

export default Layout
