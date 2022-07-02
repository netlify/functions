import type { Handler as V1Handler } from '../../v1'
import { getV2Handler, V2Function } from '../api'

type V1Function = { handler: V1Handler }

type NetlifyFunction = V1Function | V2Function

const isV1API = (func: NetlifyFunction): func is V1Function => typeof (func as V1Function).handler === 'function'

export const getHandler =
  (func: NetlifyFunction): V1Handler =>
  (event, lambdaContext) => {
    if (isV1API(func)) {
      return func.handler(event, lambdaContext)
    }

    return getV2Handler(func, event)
  }
