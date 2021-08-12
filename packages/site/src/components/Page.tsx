import React, { Suspense } from 'react'

import { useAppSelector } from '../model'

const modules = import.meta.glob('../docs/*.mdx')
// eslint-disable-next-line guard-for-in
for (const path in modules) {
  modules[path.replace('../docs/', '').replace('.mdx', '')] = modules[path]
}

const Page = () => {
  const route = useAppSelector(state => state.globals.route) || 'web infra'
  const Content = React.lazy(
    modules[route] as () => Promise<{ default: React.ComponentType<any> }>
  )

  return (
    <main>
      <Suspense fallback="loading...">
        <Content />
      </Suspense>
    </main>
  )
}

export default Page
