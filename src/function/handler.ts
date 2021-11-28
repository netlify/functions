import type { Context } from './context'
import type { Event } from './event'
import type { Response, BuilderResponse } from './response'

export interface HandlerCallback<ResponseType extends Response = Response> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (error: any, response: ResponseType): void
}

export interface BaseHandler<ResponseType extends Response = Response, C extends Context = Context> {
  (event: Event, context: C, callback?: HandlerCallback<ResponseType>): void | ResponseType | Promise<ResponseType>
}

export type Handler = BaseHandler<Response, Context>
export type BuilderHandler = BaseHandler<BuilderResponse, Context>
