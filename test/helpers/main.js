const invokeLambda = (handler, { method = 'GET', ...options } = {}) => {
  const event = {
    ...options,
    body: options.body ?? '',
    headers: {
      ...options.headers,
    },
    httpMethod: method,
    rawUrl: options.url || 'https://example.netlify',
  }

  return new Promise((resolve, reject) => {
    const callback = (error, response) => {
      if (error) {
        reject(error)
      } else {
        resolve(response)
      }
    }

    resolve(handler(event, {}, callback))
  })
}

module.exports = { invokeLambda }
