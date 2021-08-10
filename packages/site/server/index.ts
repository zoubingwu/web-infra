import * as express from 'express'
import { createServer } from 'vite'
import { createPageRender } from 'vite-plugin-ssr'

const isProduction = process.env.NODE_ENV === 'production'
const root = `${__dirname}/..`

async function startServer() {
  const app = express()

  let viteDevServer
  if (isProduction) {
    app.use(express.static(`${root}/dist/client`, { index: false }))
  } else {
    viteDevServer = await createServer({
      root,
      server: { middlewareMode: true },
    })
    app.use(viteDevServer.middlewares)
  }

  const renderPage = createPageRender({
    viteDevServer,
    isProduction,
    root,
    base: '/web-infra/',
  })

  app.get('*', async (req: any, res: any, next: any) => {
    const url = req.originalUrl
    const pageContext = {
      url,
    }
    const result = await renderPage(pageContext)
    if (result.nothingRendered) return next()
    res.status(result.statusCode).send(result.renderResult)
  })

  const port = process.env.PORT || 3000
  app.listen(port)
  console.log(`Server running at http://localhost:${port}`)
}

startServer()
  .then(() => console.log('Server started.'))
  .catch(e => console.log('Error occured: ', e))
