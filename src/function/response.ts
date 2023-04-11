import type { PipelineSource } from 'node:stream'

export interface Response {
  statusCode: number
  headers?: {
    [header: string]: boolean | number | string
  }
  multiValueHeaders?: {
    [header: string]: ReadonlyArray<boolean | number | string>
  }
  body?: string
  isBase64Encoded?: boolean
}
export interface BuilderResponse extends Response {
  ttl?: number
}

export interface StreamingResponse extends Omit<Response, 'body'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: string | PipelineSource<any>
}
