import React, { Suspense, useMemo, lazy } from 'react'

import { useAppSelector } from '../model'
import { modules } from '../docs'

const Page = () => {
  const route = useAppSelector(state => state.routes.route)
  const Content = useMemo(
    () =>
      lazy(
        modules[route] as () => Promise<{ default: React.ComponentType<any> }>
      ),
    [route]
  )

  return (
    <main className="site-page flex-1 px-40px">
      <Suspense fallback="loading...">
        <Content />
      </Suspense>
    </main>
  )
}

export default Page
