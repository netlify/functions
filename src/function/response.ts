export interface Response {
  statusCode: number
  headers?: {
    [header: string]: boolean | number | string
  }
  multiValueHeaders?: {
    [header: string]: Array<boolean | number | string>
  }
  body: string
  isBase64Encoded?: boolean
}
