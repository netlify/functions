export const invokeLambda = (handler, { method = 'GET', ...options } = {}) => {
  const event = {
    ...options,
    httpMethod: method,
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
