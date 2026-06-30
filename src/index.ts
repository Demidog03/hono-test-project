import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { hashPassword } from './lib/crypto.ts'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})

hashPassword('Qwerty123!').then(r => console.log(r))
hashPassword('Qwerty123!').then(r => console.log(r))
hashPassword('Qwerty123!').then(r => console.log(r))
hashPassword('Qwerty123!').then(r => console.log(r))