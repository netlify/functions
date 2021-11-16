export interface BaseResponse {
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

export interface Response extends BaseResponse {
  /**
   * The `ttl` value is only supported in `builder` functions
   */
  ttl?: never
}
export interface BuilderResponse extends BaseResponse {
  ttl?: number
}
