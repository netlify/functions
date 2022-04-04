import { env } from 'process'

export type GraphTokenResponseError = {
  type: 'missing-event-in-function' | 'provided-event-in-build'
  message: string
}

export type GraphTokenResponse = {
  errors?: GraphTokenResponseError[]
  token?: string | null
}

const TOKEN_HEADER = 'X-Nf-Graph-Token'

// Matches Web API Headers type (https://developer.mozilla.org/en-US/docs/Web/API/Headers)
interface RequestHeaders {
  get(name: string): string | null
}

// Matches http.IncomingHttpHeaders
interface IncomingHttpHeaders {
  [key: string]: string | string[] | undefined
}

export interface HasHeaders {
  headers: RequestHeaders | IncomingHttpHeaders
}

const hasRequestStyleHeaders = function (headers: RequestHeaders | IncomingHttpHeaders): headers is RequestHeaders {
  return (headers as RequestHeaders).get !== undefined && typeof headers.get === 'function'
}

const graphTokenFromIncomingHttpStyleHeaders = function (
  headers: RequestHeaders | IncomingHttpHeaders,
): string | null | undefined {
  if (TOKEN_HEADER in headers) {
    const header = headers[TOKEN_HEADER]
    if (header == null || typeof header === 'string') {
      return header
    }
    return header[0]
  }
}

// Backwards compatibility with older version of cli that doesn't inject header
const authlifyTokenFallback = function (event: HasHeaders): GraphTokenResponse {
  const token = (event as { authlifyToken?: string | null })?.authlifyToken
  return { token }
}

const graphTokenFromEvent = function (event: HasHeaders): GraphTokenResponse {
  const { headers } = event
  // Check if object first in case there is a header with key `get`
  const token = graphTokenFromIncomingHttpStyleHeaders(headers)
  if (token) {
    return { token }
  }

  if (hasRequestStyleHeaders(headers)) {
    return { token: headers.get(TOKEN_HEADER) }
  }

  return authlifyTokenFallback(event)
}

const graphTokenFromEnv = function (): GraphTokenResponse {
  // _NETLIFY_GRAPH_TOKEN injected by next plugin
  // eslint-disable-next-line no-underscore-dangle
  const token = env._NETLIFY_GRAPH_TOKEN || env.NETLIFY_GRAPH_TOKEN
  return { token }
}

const isEventRequired = function (): boolean {
  const localDev = env.NETLIFY_DEV === 'true'
  const localBuild = !localDev && env.NETLIFY_LOCAL === 'true'
  const remoteBuild = env.NETLIFY === 'true'
  // neither `localBuild` nor `remoteBuild` will be true in the on-demand builder case
  const inBuildPhase = localBuild || remoteBuild

  const inGetStaticProps =
    // Set by the nextjs plugin
    // eslint-disable-next-line no-underscore-dangle
    typeof env._NETLIFY_GRAPH_TOKEN !== 'undefined'

  return !inBuildPhase && !inGetStaticProps
}

const incorrectArgumentsErrors = function (
  event: HasHeaders | null | undefined,
): undefined | GraphTokenResponseError[] {
  const requiresEvent = isEventRequired()

  if (requiresEvent && event == null) {
    const errorMessage =
      'You must provide an event or request to `getNetlifyGraphToken` when used in functions and on-demand builders.'
    return [{ type: 'missing-event-in-function', message: errorMessage }]
  }

  if (!requiresEvent && event != null) {
    const errorMessage = 'You must not pass arguments to `getNetlifyGraphToken` when used in builds.'
    return [{ type: 'provided-event-in-build', message: errorMessage }]
  }
}

const logErrors = function (errors: GraphTokenResponseError[]) {
  for (const error of errors) {
    // Log errors to help guide developer
    console.error(error.message)
  }
}

export const getNetlifyGraphToken = function (
  event?: HasHeaders | null | undefined,
  // caller can prevent error log. Allows getSecrets to provide better errors
  supressLog?: boolean,
): GraphTokenResponse {
  const errors = incorrectArgumentsErrors(event)

  if (errors) {
    if (!supressLog) {
      logErrors(errors)
    }
    return { errors }
  }

  return event ? graphTokenFromEvent(event) : graphTokenFromEnv()
}
