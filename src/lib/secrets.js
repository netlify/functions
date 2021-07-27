const process = require('process')

const services = require('./services.json')

const getSecrets = () =>
  Object.entries(services).reduce((secrets, [serviceName, service]) => {
    const serviceSecrets = []
    // This is so if there are no secrets we don't add an empty object
    Object.entries(service.tokens).forEach(([tokenName, token]) => {
      if (token in process.env) {
        serviceSecrets.push([tokenName, process.env[token]])
      }
    })
    if (serviceSecrets.length !== 0) {
      // No Object.fromEntries in node < 12
      return {
        ...secrets,
        [serviceName]: serviceSecrets.reduce((acc, [tokenName, token]) => ({ ...acc, [tokenName]: token }), {}),
      }
    }
    return secrets
  }, {})

// eslint-disable-next-line promise/prefer-await-to-callbacks
const withSecrets = (handler) => (event, context, callback) => {
  const secrets = getSecrets()
  return handler(event, { ...context, secrets }, callback)
}

module.exports = {
  getSecrets,
  withSecrets,
}
