import { graphRequest } from './graph_request.js'
import {
  getNetlifyGraphToken,
  getNetlifyGraphTokenForBuild,
  GraphTokenResponseError,
  HasHeaders,
} from './graph_token.js'

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

type GraphSecretsResponse = {
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

const formatSecrets = (result: GraphSecretsResponse | undefined) => {
  if (
    !result ||
    !result.data ||
    !result.data.me ||
    !result.data.me.serviceMetadata ||
    !result.data.me.serviceMetadata.loggedInServices
  ) {
    return {}
  }

  // TODO use optional chaining once we drop node 12 or lower
  const responseServices = result.data.me.serviceMetadata.loggedInServices

  const newSecrets = responseServices.reduce((acc: NetlifySecrets, service) => {
    const normalized = serviceNormalizeOverrides[service.service] || camelize(service.friendlyServiceName)
    return { ...acc, [normalized]: service }
  }, {})

  return newSecrets
}

const logErrors = function (errors: GraphTokenResponseError[]) {
  for (const error of errors) {
    let errorMessage
    switch (error.type) {
      case 'missing-event-in-function':
        errorMessage =
          'You must provide an event or request to `getSecrets` when used in functions and on-demand builders.'
        break
      case 'provided-event-in-build':
        errorMessage = 'You must not pass arguments to `getSecrets` when used in builds.'
        break
      default: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const exhaustiveCheck: never = error.type
        errorMessage = error.type
        break
      }
    }
    const message: string = errorMessage
    console.error(message)
  }
}

// We select for more than we typically need here
// in order to allow for some metaprogramming for
// consumers downstream. Also, the data is typically
// static and shouldn't add any measurable overhead.
const findLoggedInServicesQuery = `query FindLoggedInServicesQuery {
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

const getSecretsForToken = async (token: string): Promise<NetlifySecrets> => {
  const body = JSON.stringify({ query: findLoggedInServicesQuery })

  const resultBody = await graphRequest(token, new TextEncoder().encode(body))
  const result: GraphSecretsResponse = JSON.parse(resultBody)

  const newSecrets = formatSecrets(result)

  return newSecrets
}

export const getSecrets = async (event?: HasHeaders | null | undefined): Promise<NetlifySecrets> => {
  const graphTokenResponse = getNetlifyGraphToken(event, true)
  const graphToken = graphTokenResponse.token
  if (!graphToken) {
    if (graphTokenResponse.errors) {
      logErrors(graphTokenResponse.errors)
    }
    return {}
  }

  return await getSecretsForToken(graphToken)
}

export const getSecretsForBuild = async (): Promise<NetlifySecrets> => {
  const graphTokenResponse = getNetlifyGraphTokenForBuild()
  const graphToken = graphTokenResponse.token
  if (!graphToken) {
    if (graphTokenResponse.errors) {
      logErrors(graphTokenResponse.errors)
    }
    return {}
  }

  return await getSecretsForToken(graphToken)
}
