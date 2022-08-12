import { Context as HandlerContext, Context } from '../function/context'
import { Event as HandlerEvent } from '../function/event'
import { BaseHandler, HandlerCallback } from '../function/handler'
import { Response } from '../function/response'

import { getSecrets, NetlifySecrets } from './secrets_helper'
// Fine-grained control during the preview, less necessary with a more proactive OneGraph solution
export { getSecrets, getSecretsForBuild } from './secrets_helper'
export { getNetlifyGraphToken, getNetlifyGraphTokenForBuild, GraphTokenResponse, HasHeaders } from './graph_token'

export interface ContextWithSecrets extends Context {
  secrets: NetlifySecrets
}

export type HandlerWithSecrets = BaseHandler<Response, ContextWithSecrets>

// The common usage of this module
export const withSecrets =
  (handler: BaseHandler<Response, ContextWithSecrets>) =>
  async (
    event: HandlerEvent,
    context: HandlerContext,
    // eslint-disable-next-line promise/prefer-await-to-callbacks
    callback: HandlerCallback<Response>,
  ) => {
    const secrets = await getSecrets(event)

    return handler(event, { ...context, secrets }, callback)
  }
