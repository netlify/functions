export type ScopeInfo = {
  category: string | null
  scope: string
  display: string
  isDefault: boolean
  isRequired: boolean
  description: string | null
  title: string | null
}

export type Scope = {
  scope: string
  scopeInfo: ScopeInfo | null
}

export type Service = {
  friendlyServiceName: string
  service: string
  isLoggedIn: boolean
  bearerToken: string | null
  grantedScopes: Array<Scope> | null
}

export type NetlifySecrets = {
  gitHub?: Service | null
  spotify?: Service | null
  salesforce?: Service | null
  stripe?: Service | null
}

export declare const getSecrets: () => NetlifySecrets

