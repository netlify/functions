const { HTTP_STATUS_METHOD_NOT_ALLOWED, HTTP_STATUS_OK } = require('./consts')

const augmentResponse = (response) => {
  if (!response || response.statusCode !== HTTP_STATUS_OK) {
    return response
  }

  return {
    ...response,
    metadata: { version: 1, behavior: { name: 'builder' } },
  }
}

// eslint-disable-next-line promise/prefer-await-to-callbacks
const wrapHandler = (handler) => async (event, context, callback) => {
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'HEAD') {
    return {
      body: 'Method Not Allowed',
      statusCode: HTTP_STATUS_METHOD_NOT_ALLOWED,
    }
  }

  // eslint-disable-next-line promise/prefer-await-to-callbacks
  const wrappedCallback = (response) => callback(augmentResponse(response))
  const response = await handler(event, context, wrappedCallback)

  return augmentResponse(response)
}

module.exports = { builderFunction: wrapHandler }
