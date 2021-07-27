import { Context } from '../function/context'
import { Handler } from '../function/handler'

export interface Builder {
  <C extends Context = Context>(handler: Handler<C>): Handler<C>
}

export declare const builder: Builder
