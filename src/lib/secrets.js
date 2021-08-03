const { Buffer } = require('buffer')
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
  // eslint-disable-next-line node/no-unsupported-features/node-builtins
  const requestBodyBuffer = Buffer.from(new TextEncoder().encode(requestBody))
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
        'Content-Length': Buffer.byteLength(requestBodyBuffer),
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

    req.write(requestBodyBuffer)

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

// Note: We may want to have configurable "sets" of secrets,
// e.g. "dev" and "prod"
const getSecrets = async () => {
  const secretToken = process.env.ONEGRAPH_AUTHLIFY_TOKEN

  if (!secretToken) {
    console.warn(
      'getSecrets is not set up. Visit Netlify Labs to enable it or trigger a new deploy if it has been enabled.',
    )
    return {}
  }

  // We select for more than we typically need here
  // in order to allow for some metaprogramming for
  // consumers downstream. Also, the data is typically
  // static and shouldn't add any measurable overhead.
  const doc = `query FindLoggedInServicesQuery {
    me {
      serviceMetadata {
        loggedInServices {
          friendlyServiceName
          service
          isLoggedIn
          bearerToken
          grantedScopes {
            scope
            scopeInfo {
              category
              scope
              display
              isDefault
              isRequired
              description
              title
            }
          }
        }
      }
    }
  }`

  const body = JSON.stringify({ query: doc })

  const result = await oneGraphRequest(secretToken, body)

  const newSecrets = formatSecrets(result)

  return newSecrets
}

module.exports = {
  getSecrets,
}
