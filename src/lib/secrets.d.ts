import { Context } from '../function/context'
import { Handler } from '../function/handler'
import * as services from './services.json'

export type Services = typeof services

export type ServiceKey = keyof Services

export type ServiceTokens<T extends ServiceKey> = Services[T]['tokens']

export type NetlifySecrets = {
  [K in ServiceKey]?: ServiceTokens<K>
}

export interface ContextWithSecrets extends Context {
  secrets: NetlifySecrets
}

export type HandlerWithSecrets = Handler<ContextWithSecrets>

export declare const getSecrets: () => NetlifySecrets

export declare const withSecrets: <C extends Context>(handler: HandlerWithSecrets) => Handler<C>
