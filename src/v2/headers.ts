import { Headers } from 'undici'

import type { HandlerEvent } from '../v1'

const fromEventHeaders = (eventHeaders: HandlerEvent['headers']) => {
  const headers = new Headers()

  Object.entries(eventHeaders).forEach(([name, value]) => {
    if (value !== undefined) {
      headers.set(name, value)
    }
  })

  return headers
}

const toObject = (headers: Headers) => {
  const headersObj: Record<string, string> = {}

  for (const [name, value] of headers.entries()) {
    headersObj[name] = value
  }

  return headersObj
}

export { fromEventHeaders, toObject }
