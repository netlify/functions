import isPromise from 'is-promise'

import { Handler } from '../function/handler'
import { Response } from '../function/response'

import { BUILDER_FUNCTIONS_FLAG, HTTP_STATUS_METHOD_NOT_ALLOWED, HTTP_STATUS_OK, METADATA_VERSION } from './consts'

type Config = {
  /** @default 0 */
  ttl: number
}

const augmentResponse = (response: Response, ttl: number) => {
  if (!response || response.statusCode !== HTTP_STATUS_OK) {
    return response
  }

  return {
    ...response,
    metadata: { version: METADATA_VERSION, builder_function: BUILDER_FUNCTIONS_FLAG, ttl },
  }
}

const wrapHandler =
  (handler: Handler, config?: Config): Handler =>
  // eslint-disable-next-line promise/prefer-await-to-callbacks
  (event, context, callback) => {
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

    // Get needed config values.
    const ttl = config === undefined ? 0 : config.ttl

    // eslint-disable-next-line promise/prefer-await-to-callbacks
    const wrappedCallback = (error: unknown, response: Response) => callback(error, augmentResponse(response, ttl))
    const execution = handler(modifiedEvent, context, wrappedCallback)

    if (isPromise(execution)) {
      // eslint-disable-next-line promise/prefer-await-to-then
      return execution.then((response) => augmentResponse(response, ttl))
    }

    return execution
  }

export { wrapHandler as builder }
