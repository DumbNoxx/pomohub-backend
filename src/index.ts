import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { env } from './config'
import { AuthRoute } from './routes/index'
import { cors } from 'hono/cors'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.use("/*", cors({
  origin: env.FRONTEND,
  allowMethods: ["POST", "GET", "PUT"],
  credentials: true
}))

app.route("/auth", AuthRoute)



serve({
  fetch: app.fetch,
  port: env.PORT
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
