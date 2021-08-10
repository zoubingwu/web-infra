import React from 'react'
import ReactDOM from 'react-dom'
import { getPage } from 'vite-plugin-ssr/client'

import PageLayout from './PageLayout'

import 'virtual:windi.css'

;(async function hydrate() {
  const pageContext = await getPage()
  const { Page, pageProps } = pageContext

  ReactDOM.hydrate(
    <PageLayout>
      <Page {...pageProps} />
    </PageLayout>,
    document.getElementById('page-view')
  )
})()
