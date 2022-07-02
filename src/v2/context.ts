import { Headers, Response } from 'undici'

import type { CookieStore } from './cookie_store'
import { parseIP } from './ip'

const json = (input: unknown) => {
  const data = JSON.stringify(input)

  return new Response(data, {
    headers: {
      'content-type': 'application/json',
    },
  })
}

const getContext = ({ cookies, headers }: { cookies: CookieStore; headers: Headers }) => {
  const ip = parseIP(headers)
  const context = {
    cookies: cookies.getPublicInterface(),
    ip,
    json,
    log: console.log,
  }

  return context
}

type Context = ReturnType<typeof getContext>

export { Context, getContext }
