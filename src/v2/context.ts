import { Headers, Request, Response, fetch } from 'undici'

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

const getContext = (req: Request, cookies: CookieStore) => {
  const context = {
    cookies: cookies.getPublicInterface(),
    geo: parseGeoHeader(req.headers.get(NFGeo)),
    ip: getIP(req.headers.get(NFClientConnectionIP)),
    json,
    log: console.log,
    next: () => {
      throw new Error('`context.next` is not implemented for serverless functions')
    },
    rewrite: (input: string | URL) => {
      const url = makeURL(input, req.url)

      return rewrite(url)
    },
    site: getSiteObject(),
  }

  return context
}

const makeURL = (input: string | URL, baseURL: string) => {
  if (input instanceof URL) {
    return input
  }

  if (input.startsWith('/')) {
    const url = new URL(baseURL)

    url.pathname = input

    return url
  }

  return new URL(input)
}

const rewrite = async (url: string | URL) => {
  const res = await fetch(url)

  return res
}

type Context = ReturnType<typeof getContext>

export { Context, getContext }
