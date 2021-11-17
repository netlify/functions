import { Context as HandlerContext, Context } from '../function/context'
import { Event as HandlerEvent } from '../function/event'
import { Handler, HandlerCallback } from '../function/handler'

import { getSecrets, HandlerEventWithOneGraph, NetlifySecrets } from './secrets_helper'
// Fine-grained control during the preview, less necessary with a more proactive OneGraph solution
export { getSecrets } from './secrets_helper'

export interface ContextWithSecrets extends Context {
  secrets: NetlifySecrets
}

export type HandlerWithSecrets = Handler<ContextWithSecrets>

// The common usage of this module
export const withSecrets =
  (handler: Handler<ContextWithSecrets>) =>
  // eslint-disable-next-line promise/prefer-await-to-callbacks
  async (event: HandlerEventWithOneGraph | HandlerEvent, context: HandlerContext, callback: HandlerCallback) => {
    const secrets = await getSecrets(event as HandlerEventWithOneGraph)

    return handler(event, { ...context, secrets }, callback)
  }
