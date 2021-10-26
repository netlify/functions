import type { Context } from './context'
import type { Event } from './event'
import type { Response } from './response'

export interface HandlerCallback {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (error: any, response: Response): void
}

export interface Handler {
  (event: Event, context: Context, callback: HandlerCallback): void | Response | Promise<Response>
}
