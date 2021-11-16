import { Handler, HandlerCallback, HandlerContext } from '../function'
import { Context } from '../function/context'

import { getSecrets, HandlerEventWithOneGraph, NetlifySecrets } from './secrets_helper'

export interface ContextWithSecrets extends Context {
  secrets: NetlifySecrets
}

export type HandlerWithSecrets = Handler<ContextWithSecrets>

const withSecrets: unknown =
  (handler: HandlerWithSecrets) =>
  // eslint-disable-next-line promise/prefer-await-to-callbacks
  async (event: HandlerEventWithOneGraph, context: HandlerContext, callback: HandlerCallback) => {
    const secrets = await getSecrets(event)

    return handler(event, { ...context, secrets }, callback)
  }

module.exports = {
  // Fine-grained control during the preview, less necessary with a more proactive OneGraph solution
  getSecrets,
  // The common usage of this module
  withSecrets,
}
