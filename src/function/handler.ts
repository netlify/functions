import type { Context } from './context'
import type { Event } from './event'
import type { Response, BuilderResponse } from './response'

export interface HandlerCallback<TResponse> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (error: any, response: TResponse): void
}

interface BaseHandler<TResponse> {
  (event: Event, context: Context, callback: HandlerCallback<TResponse>): void | TResponse | Promise<TResponse>
}

export type Handler = BaseHandler<Response>
export type BuilderHandler = BaseHandler<BuilderResponse>
