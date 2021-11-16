import type { Context } from './context'
import type { Event } from './event'
import type { Response } from './response'

export interface HandlerCallback {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (error: any, response: Response): void
}

export interface Handler<C extends Context = Context> {
  (event: Event, context: C, callback: HandlerCallback): void | Response | Promise<Response>
}
