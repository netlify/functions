import { Headers, Response } from 'undici'

import type { CookieStore } from './cookie_store'
import { parseGeoHeader } from './geo'
import { NFClientConnectionIP, NFGeo } from './headers'
import { getIP } from './ip'
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
  const context = {
    cookies: cookies.getPublicInterface(),
    geo: parseGeoHeader(headers.get(NFGeo)),
    ip: getIP(headers.get(NFClientConnectionIP)),
    json,
    log: console.log,
    site: getSiteObject(),
  }

  return context
}

type Context = ReturnType<typeof getContext>

export { Context, getContext }
