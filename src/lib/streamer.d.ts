import type { Handler } from '../function/handler'
import type { Context } from '../function/context'
import type { Event } from '../function/event'
import type { Response } from '../function/response'
import type { StreamingResponse } from '../function/streaming-response'

export interface StreamingHandler {
  (event: Event, res: StreamingResponse, context: Context, callback: HandlerCallback): void | Promise<void>
}

export interface Streamer {
  (handler: StreamingHandler): Handler
}

export declare const streamer: Streamer
