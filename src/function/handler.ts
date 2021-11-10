import type { Context } from './context'
import type { Event } from './event'
import type { Response, BuilderResponse } from './response'

export interface HandlerCallback {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (error: any, response: Response): void
}

export interface Handler {
  (event: Event, context: Context, callback: HandlerCallback): void | Response | Promise<Response>
}

export interface BuilderCallback {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (error: any, response: BuilderResponse): void
}

export interface BuilderHandler {
  (event: Event, context: Context, callback: BuilderCallback): void | BuilderResponse | Promise<BuilderResponse>
}
