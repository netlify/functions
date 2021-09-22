import { OutgoingHttpHeaders, OutgoingHttpHeader, OutgoingMessage } from 'http'
import { Socket } from 'net'

class StreamingResponse extends OutgoingMessage {
  statusCode: number
  statusMessage: string
  assignSocket(socket: Socket): void
  detachSocket(socket: Socket): void
  writeContinue(callback?: () => void): void
  writeHead(statusCode: number, statusMessage?: string, headers?: OutgoingHttpHeaders | OutgoingHttpHeader[]): this
  writeHead(statusCode: number, headers?: OutgoingHttpHeaders | OutgoingHttpHeader[]): this
  writeProcessing(): void
}
