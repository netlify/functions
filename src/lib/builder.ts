import isPromise from 'is-promise'

import { HandlerCallback, HandlerContext, HandlerEvent } from '../function'
import { Handler } from '../function/handler'
import { Response } from '../function/response'

import { BUILDER_FUNCTIONS_FLAG, HTTP_STATUS_METHOD_NOT_ALLOWED, HTTP_STATUS_OK, METADATA_VERSION } from './consts'

const augmentResponse = (response: Response) => {
  if (!response || response.statusCode !== HTTP_STATUS_OK) {
    return response
  }

  return {
    ...response,
    metadata: { version: METADATA_VERSION, builder_function: BUILDER_FUNCTIONS_FLAG },
  }
}

const wrapHandler =
  (handler: Handler<HandlerContext>): Handler<HandlerContext> =>
  // eslint-disable-next-line promise/prefer-await-to-callbacks
  (event: HandlerEvent, context: HandlerContext, callback: HandlerCallback) => {
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
    const wrappedCallback = (error: unknown, response: Response) => callback(error, augmentResponse(response))
    const execution = handler(modifiedEvent, context, wrappedCallback)

    if (isPromise(execution)) {
      // eslint-disable-next-line promise/prefer-await-to-then
      return execution.then(augmentResponse)
    }

    return execution
  }

export { wrapHandler as builder }
