import { Context as HandlerContext, Context } from '../v1/context'
import { Event as HandlerEvent } from '../v1/event'
import { BaseHandler, HandlerCallback } from '../v1/handler'
import { Response } from '../v1/response'

import { getSecrets, NetlifySecrets } from './secrets_helper'
// Fine-grained control during the preview, less necessary with a more proactive OneGraph solution
export { getSecrets } from './secrets_helper'
export { getNetlifyGraphToken, GraphTokenResponse, HasHeaders } from './graph_token'

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
