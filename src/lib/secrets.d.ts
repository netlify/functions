import { HandlerEvent } from '../function'
import { Context } from '../function/context'
import { Handler } from '../function/handler'

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
}

export interface ContextWithSecrets extends Context {
  secrets: NetlifySecrets
}

export type HandlerWithSecrets = Handler<ContextWithSecrets>

export declare const getSecrets: (event: ?HandlerEvent) => NetlifySecrets

export declare const withSecrets: <C extends Context>(handler: HandlerWithSecrets) => Handler<C>
