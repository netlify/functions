import { Headers, Response } from 'undici'

import type { CookieStore } from './cookie_store'
import { parseIP } from './ip'
import { getSiteObject } from './site'

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
    site: getSiteObject(),
  }

  return context
}

type Context = ReturnType<typeof getContext>

export { Context, getContext }
