const invokeLambda = (handler, { method = 'GET' } = {}) => {
  const event = {
    httpMethod: method,
  }

  return new Promise((resolve) => {
    resolve(handler(event, {}, resolve))
  })
}

module.exports = { invokeLambda }
