import type { Context } from './context'
import type { Event } from './event'
import type { BuilderResponse } from './response'

export interface HandlerCallback<ResponseType> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (error: any, response: ResponseType): void
}

export interface Handler<ResponseType, C extends Context = Context> {
  (event: Event, context: C, callback: HandlerCallback<ResponseType>): void | ResponseType | Promise<ResponseType>
}

export type BuilderHandler = Handler<BuilderResponse, Context>
