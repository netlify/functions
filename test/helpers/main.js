const invokeLambda = (handler, { method = 'GET' } = {}) => {
  const event = {
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

module.exports = { invokeLambda }
