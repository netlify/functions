import { pipeline } from 'node:stream'

import type { Handler, HandlerEvent, HandlerContext, HandlerResponse, StreamingHandler } from '../function/index.js'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace awslambda {
    function streamifyResponse(
      handler: (
        event: HandlerEvent,
        responseStream: NodeJS.WritableStream,
        context: HandlerContext,
      ) => Promise<HandlerResponse>,
    ): Handler
  }
}

/**
 * Enables streaming responses. `body` now accepts a `Readable` stream or Web stream.
 *
 * @example
 * ```
 * const { Readable } = require('stream');
 *
 * export const handler = stream(async (event, context) => {
 *   const stream = Readable.from(Buffer.from(JSON.stringify(event)))
 *   return {
 *     statusCode: 200,
 *     body: stream,
 *   }
 * })
 * ```
 *
 * @example
 * ```
 * export const handler = stream(async (event, context) => {
 *   const response = await fetch('https://api.openai.com/', { ... })
 *   // ...
 *   return {
 *     statusCode: 200,
 *     body: response.body, // Web stream
 *   }
 * })
 * ```
 *
 * @param handler
 * @see https://ntl.fyi/streaming-func
 */
const stream = (handler: StreamingHandler): Handler =>
  awslambda.streamifyResponse(async (event, responseStream, context) => {
    const { body, ...rest } = await handler(event, context)

    if (typeof body === 'undefined' || typeof body === 'string') {
      return {
        body,
        ...rest,
      }
    }

    pipeline(body, responseStream)

    return {
      ...rest,
    }
  })

export { stream }
