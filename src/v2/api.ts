import type { HandlerEvent } from '../v1'
import { Request, Response } from 'undici'

import { Context, getContext } from './context'
import { CookieStore } from './cookie_store'
import { fromEventHeaders, toObject as headersToObject } from './headers'

export type V2Function = { default: (req: Request, context: Context) => Promise<Response> }

export const getV2Handler = async (func: V2Function, event: HandlerEvent) => {
  const headers = fromEventHeaders(event.headers)
  const req = new Request(event.rawUrl, {
    body: event.body,
    headers,
    method: event.httpMethod,
  })
  const cookies = new CookieStore(req)
  const context = getContext({ cookies })
  const res = await func.default(req, context)

  cookies.apply(res)

  const responseHeaders = headersToObject(res.headers)
  const body = await res.text()

  return {
    body,
    headers: responseHeaders,
    statusCode: res.status,
  }
}
