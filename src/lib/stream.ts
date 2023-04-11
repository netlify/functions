import { pipeline as pipelineSync } from 'node:stream'
import { promisify } from 'node:util'

import type { Handler, HandlerEvent, HandlerContext, StreamingHandler, StreamingResponse } from '../function/index.js'

// Node v14 doesn't have node:stream/promises
const pipeline = promisify(pipelineSync)

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace awslambda {
    function streamifyResponse(
      handler: (event: HandlerEvent, responseStream: NodeJS.WritableStream, context: HandlerContext) => Promise<void>,
    ): Handler

    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace HttpResponseStream {
      function from(stream: NodeJS.WritableStream, metadata: Omit<StreamingResponse, 'body'>): NodeJS.WritableStream
    }
  }
}

/**
 * Enables streaming responses. `body` accepts a Node.js `Readable` stream or a WHATWG `ReadableStream`.
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
    const { body, ...httpResponseMetadata } = await handler(event, context)

    const responseBody = awslambda.HttpResponseStream.from(responseStream, httpResponseMetadata)

    if (typeof body === 'undefined') {
      responseBody.end()
    } else if (typeof body === 'string') {
      responseBody.write(body)
      responseBody.end()
    } else {
      await pipeline(body, responseBody)
    }
  })

export { stream }
