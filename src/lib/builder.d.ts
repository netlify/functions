import { Handler } from '../function/handler'

export interface Builder {
  (handler: Handler): Handler
}

export declare const builder: Builder
