import { Event as HandlerEvent } from '../function/event'

import { oneGraphRequest } from './onegraph_request'

const TOKEN_HEADER = 'x-nf-graph-token'

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

const formatSecrets = (result: OneGraphSecretsResponse | undefined) => {
  const responseServices = result?.data?.me?.serviceMetadata?.loggedInServices

  if (!responseServices) {
    return {}
  }

  const newSecrets = responseServices.reduce((acc: NetlifySecrets, service) => {
    const normalized = serviceNormalizeOverrides[service.service] || camelize(service.friendlyServiceName)
    return { ...acc, [normalized]: service }
  }, {})

  return newSecrets
}

interface RequestHeaders {
  get(name: string): string | null
}

interface IncomingMessageHeaders {
  [key: string]: string
}

interface HasHeaders {
  headers: RequestHeaders | IncomingMessageHeaders
}

const hasRequestStyleHeaders = function (headers: RequestHeaders | IncomingMessageHeaders): headers is RequestHeaders {
  return (headers as RequestHeaders).get !== undefined && typeof headers.get === 'function'
}

const graphTokenFromHeaders = function (headers: RequestHeaders | IncomingMessageHeaders): string | null {
  // Check if object first in case there is a header with key `get`
  if (TOKEN_HEADER in headers) {
    return headers[TOKEN_HEADER]
  }
  if (hasRequestStyleHeaders(headers)) {
    return headers.get(TOKEN_HEADER)
  }
  return null
}

// Note: We may want to have configurable "sets" of secrets,
// e.g. "dev" and "prod"
export const getSecrets = async (event: HandlerEvent): Promise<NetlifySecrets> => {
  const graphToken = graphTokenFromHeaders((event as HasHeaders).headers)

  if (!graphToken) {
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
  const resultBody = await oneGraphRequest(graphToken, new TextEncoder().encode(body))
  const result: OneGraphSecretsResponse = JSON.parse(resultBody)

  const newSecrets = formatSecrets(result)

  return newSecrets
}
