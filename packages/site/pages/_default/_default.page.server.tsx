import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { html } from 'vite-plugin-ssr'
import type { PageContextBuiltIn } from 'vite-plugin-ssr/types'

import PageLayout from './PageLayout'

export type PageProps = {}
export type PageContext = PageContextBuiltIn & {
  Page: (pageProps: PageProps) => JSX.Element
  pageProps: PageProps
  documentProps?: {
    title?: string
    description?: string
  }
}

// See https://vite-plugin-ssr.com/data-fetching
export const passToClient = ['pageProps']

export function render(pageContext: PageContext) {
  const { Page, pageProps } = pageContext
  const pageHtml = ReactDOMServer.renderToString(
    <PageLayout>
      <Page {...pageProps} />
    </PageLayout>
  )

  // See https://vite-plugin-ssr.com/html-head
  const { documentProps } = pageContext
  const title = documentProps?.title || 'Vite SSR app'
  const desc = documentProps?.description || 'App using Vite + vite-plugin-ssr'

  return html`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="${desc}" />
        <title>${title}</title>
      </head>
      <body>
        <div id="page-view">${html.dangerouslySkipEscape(pageHtml)}</div>
      </body>
    </html>`
}
