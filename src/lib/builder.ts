import { BuilderHandler, Handler, HandlerCallback } from '../function/handler.js'
import { HandlerResponse, BuilderResponse } from '../function/handler_response.js'
import { HandlerContext, HandlerEvent } from '../function/index.js'

import { BUILDER_FUNCTIONS_FLAG, HTTP_STATUS_METHOD_NOT_ALLOWED, METADATA_VERSION } from './consts.js'

const augmentResponse = (response: BuilderResponse) => {
  if (!response) {
    return response
  }
  const metadata = { version: METADATA_VERSION, builder_function: BUILDER_FUNCTIONS_FLAG, ttl: response.ttl || 0 }

  return {
    ...response,
    metadata,
  }
}

const wrapHandler =
  (handler: BuilderHandler): Handler =>
  // eslint-disable-next-line promise/prefer-await-to-callbacks
  (event: HandlerEvent, context: HandlerContext, callback?: HandlerCallback<HandlerResponse>) => {
    if (event.httpMethod !== 'GET' && event.httpMethod !== 'HEAD') {
      return Promise.resolve({
        body: 'Method Not Allowed',
        statusCode: HTTP_STATUS_METHOD_NOT_ALLOWED,
      })
    }

    // Removing query string parameters from the builder function.
    const modifiedEvent = {
      ...event,
      multiValueQueryStringParameters: {},
      queryStringParameters: {},
    }

    const wrappedCallback = (error: unknown, response: BuilderResponse) =>
      // eslint-disable-next-line promise/prefer-await-to-callbacks
      callback ? callback(error, augmentResponse(response)) : null
    const execution = handler(modifiedEvent, context, wrappedCallback)

    // eslint-disable-next-line promise/prefer-await-to-then
    if (typeof execution === 'object' && typeof execution.then === 'function') {
      // eslint-disable-next-line promise/prefer-await-to-then
      return execution.then(augmentResponse)
    }

    return execution
  }

export { wrapHandler as builder }
