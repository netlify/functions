import { Buffer } from 'buffer'
import { request } from 'https'
import { env } from 'process'

import { Event as HandlerEvent } from '../function/event'

const services = {
  gitHub: null,
  spotify: null,
  salesforce: null,
  stripe: null,
}

export type Service = {
  friendlyServiceName: string
  service: string
  isLoggedIn: boolean
  bearerToken: string | null
  grantedScopes: Array<{
    scope: string
    scopeInfo: {
      category: string | null
      scope: string
      display: string
      isDefault: boolean
      isRequired: boolean
      description: string | null
      title: string | null
    }
  }> | null
}

export type Services = typeof services

export type ServiceKey = keyof Services

export type ServiceTokens = Service

export type NetlifySecrets = {
  [K in ServiceKey]?: Service
} & { [key: string]: Service }

type OneGraphSecretsResponse = {
  data?: {
    me?: {
      serviceMetadata?: {
        loggedInServices: [Service]
      }
    }
  }
}

const siteId = env.SITE_ID

const camelize = function (text: string) {
  const safe = text.replace(/[-_\s.]+(.)?/g, (_, sub) => (sub ? sub.toUpperCase() : ''))
  return safe.slice(0, 1).toLowerCase() + safe.slice(1)
}

type ServiceNormalizeOverrides = {
  GITHUB: string
  [key: string]: string
}

// The services will be camelized versions of the OneGraph service enums
// unless overridden by the serviceNormalizeOverrides object
const serviceNormalizeOverrides: ServiceNormalizeOverrides = {
  // Keys are the OneGraph service enums, values are the desired `secret.<service>` names
  GITHUB: 'gitHub',
}

const oneGraphRequest = function (secretToken: string, requestBody: Uint8Array): Promise<OneGraphSecretsResponse> {
  return new Promise((resolve, reject) => {
    const port = 443

    const options = {
      host: 'serve.onegraph.com',
      path: `/graphql?app_id=${siteId}`,
      port,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Content-Length': requestBody ? Buffer.byteLength(requestBody) : 0,
      },
    }

    const req = request(options, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(String(res.statusCode)))
      }

      const body: Array<Uint8Array> = []

      res.on('data', (chunk) => {
        body.push(chunk)
      })

      res.on('end', () => {
        const data = Buffer.concat(body).toString()
        try {
          const result: OneGraphSecretsResponse = JSON.parse(data)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.write(requestBody)

    req.end()
  })
}

const formatSecrets = (result: OneGraphSecretsResponse | undefined) => {
  const responseServices = result?.data?.me?.serviceMetadata?.loggedInServices

  if (responseServices) {
    const newSecrets = responseServices.reduce((acc: NetlifySecrets, service) => {
      const normalized = serviceNormalizeOverrides[service.service] || camelize(service.friendlyServiceName)
      return { ...acc, [normalized]: service }
    }, {})

    return newSecrets
  }

  return {}
}

type OneGraphPayload = { authlifyToken: string | undefined }

export type HandlerEventWithOneGraph = HandlerEvent & { _oneGraph: OneGraphPayload }

// Note: We may want to have configurable "sets" of secrets,
// e.g. "dev" and "prod"
export const getSecrets = async (
  event?: HandlerEventWithOneGraph | HandlerEvent | undefined,
): Promise<NetlifySecrets> => {
  // Allow us to get the token from event if present, else fallback to checking the env
  // eslint-disable-next-line no-underscore-dangle
  const eventToken = (event as HandlerEventWithOneGraph)?._oneGraph?.authlifyToken
  const secretToken = eventToken || env.ONEGRAPH_AUTHLIFY_TOKEN

  if (!secretToken) {
    return {}
  }

  // We select for more than we typeically need here
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

  // eslint-disable-next-line node/no-unsupported-features/node-builtins
  const result = await oneGraphRequest(secretToken, new TextEncoder().encode(body))

  const newSecrets = formatSecrets(result)

  return newSecrets
}
