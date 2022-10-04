import { Context as HandlerContext, Context } from '../function/context.js'
import { Event as HandlerEvent } from '../function/event.js'
import { BaseHandler, HandlerCallback } from '../function/handler.js'
import { Response } from '../function/response.js'

import { getSecrets, NetlifySecrets } from './secrets_helper.js'
// Fine-grained control during the preview, less necessary with a more proactive OneGraph solution
export { getSecrets, getSecretsForBuild } from './secrets_helper.js'
export { getNetlifyGraphToken, getNetlifyGraphTokenForBuild, GraphTokenResponse, HasHeaders } from './graph_token.js'

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
