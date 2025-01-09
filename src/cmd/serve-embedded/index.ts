import ngrok from '@ngrok/ngrok'
import { createServer, IncomingMessage, ServerResponse } from 'http'
import next from 'next'
import { parse } from 'url'

import dotenv from 'dotenv'
dotenv.config()

const port = parseInt(process.env.PORT ?? '3000', 10)
const app = next({ dev: true })
const handle = app.getRequestHandler()

app.prepare().then(async () => {
  createServer((req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
    if (!req.url) {
      throw new Error('Failed to extract url from request')
    }
    const parsedUrl = parse(req.url, true)
    res.setHeader('Set-Cookie', `ngrokUrl=${ngrokUrl}`)
    res.setHeader('X-Frame-Options', ``)
    handle(req, res, parsedUrl)
  }).listen(port)

  console.info(`> Server listening at http://localhost:${port}`)
  console.info('> Opening an ngrok tunnel to the server...')

  const listener = await ngrok.forward({
    authtoken: process.env.NGROK_AUTHTOKEN,
    addr: port,
  })

  console.info(`> Tunnel opened at ${listener.url()}`)
  const ngrokUrl = listener.url()

  if (!ngrokUrl) {
    throw new Error('Failed to get a ngrok URL for tunnel')
  }

  const { default: open, apps } = await import('open')
  const url = `https://dashboard.copilot.com/dev-mode?url=${encodeURIComponent(ngrokUrl)}`

  console.info(`> Opening browser at ${url}`)

  open(url, {
    app: Array.isArray(apps.browser) ? apps.browser[0] : apps.browser,
  })
})

process.stdin.resume()

process.on('SIGINT', async () => {
  console.info('> Closing ngrok tunnel...')
  await ngrok.kill()
  console.info('> Ngrok tunnel closed.')
  process.exit()
})
