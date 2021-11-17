import isPromise from 'is-promise'

import { HandlerContext, HandlerEvent } from '../function'
import { BuilderHandler, Handler, HandlerCallback } from '../function/handler'
import { Response, BuilderResponse } from '../function/response'

import { BUILDER_FUNCTIONS_FLAG, HTTP_STATUS_METHOD_NOT_ALLOWED, HTTP_STATUS_OK, METADATA_VERSION } from './consts'

const augmentResponse = (response: BuilderResponse) => {
  if (!response || response.statusCode !== HTTP_STATUS_OK) {
    return response
  }
  const metadata = { version: METADATA_VERSION, builder_function: BUILDER_FUNCTIONS_FLAG, ttl: response.ttl ?? 0 }

  return {
    ...response,
    metadata,
  }
}

const wrapHandler =
  (handler: BuilderHandler): Handler =>
  // eslint-disable-next-line promise/prefer-await-to-callbacks
  (event: HandlerEvent, context: HandlerContext, callback: HandlerCallback<Response>) => {
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

    // eslint-disable-next-line promise/prefer-await-to-callbacks
    const wrappedCallback = (error: unknown, response: BuilderResponse) => callback(error, augmentResponse(response))
    const execution = handler(modifiedEvent, context, wrappedCallback)

    if (isPromise(execution)) {
      // eslint-disable-next-line promise/prefer-await-to-then
      return execution.then(augmentResponse)
    }

    return execution
  }

export { wrapHandler as builder }
