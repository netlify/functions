const isPromise = require('is-promise')

const { BUILDER_FUNCTIONS_FLAG, HTTP_STATUS_METHOD_NOT_ALLOWED, HTTP_STATUS_OK, METADATA_VERSION } = require('./consts')

const augmentResponse = (response) => {
  if (!response || response.statusCode !== HTTP_STATUS_OK) {
    return response
  }

  return {
    ...response,
    metadata: { version: METADATA_VERSION, builder_function: BUILDER_FUNCTIONS_FLAG },
  }
}

// eslint-disable-next-line promise/prefer-await-to-callbacks
const wrapHandler = (handler) => (event, context, callback) => {
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'HEAD') {
    return Promise.resolve({
      body: 'Method Not Allowed',
      statusCode: HTTP_STATUS_METHOD_NOT_ALLOWED,
    })
  }

  // eslint-disable-next-line promise/prefer-await-to-callbacks
  const wrappedCallback = (error, response) => callback(error, augmentResponse(response))
  const execution = handler(event, context, wrappedCallback)

  if (isPromise(execution)) {
    // eslint-disable-next-line promise/prefer-await-to-then
    return execution.then(augmentResponse)
  }

  return execution
}

module.exports = { builderFunction: wrapHandler }
