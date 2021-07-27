const Buffer = require('buffer')
const https = require('https')
const process = require('process')

const { ONEGRAPH_AUTHLIFY_APP_ID } = require('./consts')

const camelize = function (text) {
  const safe = text.replace(/[-_\s.]+(.)?/g, (_, sub) => (sub ? sub.toUpperCase() : ''))
  return safe.slice(0, 1).toLowerCase() + safe.slice(1)
}

// The services will be camelized versions of the OneGraph service enums
// unless overridden by the serviceNormalizeOverrides object
const serviceNormalizeOverrides = {
  // Keys are the OneGraph service enums, values are the desired `secret.<service>` names
  GITHUB: 'gitHub',
}

const oneGraphRequest = function (secretToken, requestBody) {
  return new Promise((resolve, reject) => {
    const port = 443

    const options = {
      host: 'serve.onegraph.com',
      path: `/graphql?app_id=${ONEGRAPH_AUTHLIFY_APP_ID}`,
      port,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Content-Length': requestBody ? Buffer.byteLength(requestBody) : 0,
      },
    }

    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(res.statusCode))
      }

      let body = []

      res.on('data', (chunk) => {
        body.push(chunk)
      })

      res.on('end', () => {
        const data = Buffer.concat(body).toString()
        try {
          body = JSON.parse(data)
        } catch (error) {
          reject(error)
        }
        resolve(body)
      })
    })

    req.on('error', (error) => {
      reject(error.message)
    })

    req.write(requestBody)

    req.end()
  })
}

const formatSecrets = (result) => {
  const services =
    result.data && result.data.me && result.data.me.serviceMetadata && result.data.me.serviceMetadata.loggedInServices

  if (services) {
    const newSecrets = services.reduce((acc, service) => {
      const normalized = serviceNormalizeOverrides[service.service] || camelize(service.friendlyServiceName)
      // eslint-disable-next-line no-param-reassign
      acc[normalized] = service
      return acc
    }, {})

    return newSecrets
  }

  return {}
}

const secretsCache = {}

// Note: We may want to have configurable "sets" of secrets,
// e.g. "dev" and "prod"
const getSecrets = async () => {
  const secretToken = process.env.ONEGRAPH_AUTHLIFY_TOKEN

  if (!secretToken) {
    return {}
  }

  // Cache in memory for the life of the serverless process
  if (secretsCache[secretToken]) {
    return secretsCache[secretToken]
  }

  const doc = `query FindLoggedInServicesQuery {
    me {
      serviceMetadata {
        loggedInServices {
          friendlyServiceName
          service
          isLoggedIn
          bearerToken
        }
      }
    }
  }`

  const body = JSON.stringify({ query: doc })

  // eslint-disable-next-line node/no-unsupported-features/node-builtins
  const result = await oneGraphRequest(secretToken, new TextEncoder().encode(body))

  const newSecrets = formatSecrets(result)
  secretsCache[secretToken] = newSecrets

  return newSecrets
}

// eslint-disable-next-line promise/prefer-await-to-callbacks
const withSecrets = (handler) => async (event, context, callback) => {
  const secrets = await getSecrets()

  return handler(event, { ...context, secrets }, callback)
}

module.exports = {
  // Fine-grained control during the preview, less necessary with a more proactive OneGraph solution
  getSecrets,
  // The common usage of this module
  withSecrets,
}
