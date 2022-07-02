import { Request, Response } from 'undici'

import type { HandlerEvent } from '../v1'

import { Context, getContext } from './context'
import { CookieStore } from './cookie_store'
import { fromEventHeaders, toObject as headersToObject } from './headers'

export type V2Function = { default: (req: Request, context: Context) => Promise<Response> }

export const getV2Handler = async (func: V2Function, event: HandlerEvent) => {
  const headers = fromEventHeaders(event.headers)
  const body = event.body === '' ? undefined : event.body
  const req = new Request(event.rawUrl, {
    body,
    headers,
    method: event.httpMethod,
  })
  const cookies = new CookieStore(req)
  const context = getContext({ cookies })
  const res = await func.default(req, context)

  cookies.apply(res)

  const responseHeaders = headersToObject(res.headers)
  const responseBody = await res.text()

  return {
    body: responseBody,
    headers: responseHeaders,
    statusCode: res.status,
  }
}
