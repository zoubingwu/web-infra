import React, { Suspense, useMemo, lazy } from 'react'

import { useAppSelector } from '../model'
import { modules } from '../docs'

const Page = () => {
  const route = useAppSelector(state => state.routes.route)
  const topRoute = route.split('.')[0]
  const Content = useMemo(() => {
    return lazy(
      modules[topRoute] as () => Promise<{ default: React.ComponentType<any> }>
    )
  }, [topRoute])

  return (
    <main className="site-main-content flex-1 px-40px py-15px">
      <Suspense fallback="loading...">
        <Content />
      </Suspense>
    </main>
  )
}

export default Page
