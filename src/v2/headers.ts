import { Headers } from 'undici'

import type { HandlerEvent } from '../v1'

export const NFClientConnectionIP = 'x-nf-client-connection-ip'
export const NFGeo = 'x-nf-geo'

export const fromEventHeaders = (eventHeaders: HandlerEvent['headers']) => {
  const headers = new Headers()

  Object.entries(eventHeaders).forEach(([name, value]) => {
    if (value !== undefined) {
      headers.set(name.toLowerCase(), value)
    }
  })

  return headers
}

export const toObject = (headers: Headers) => {
  const headersObj: Record<string, string> = {}

  for (const [name, value] of headers.entries()) {
    headersObj[name] = value
  }

  return headersObj
}
