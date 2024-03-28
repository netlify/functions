const systemLogTag = '__nfSystemLog'

const serializeError = (error: Error): Record<string, unknown> => {
  const cause = error?.cause instanceof Error ? serializeError(error.cause) : error.cause

  return {
    error: error.message,
    error_cause: cause,
    error_stack: error.stack,
  }
}

// eslint pretends there's a different enum at the same place - it's wrong!
// eslint-disable-next-line no-shadow
export enum LogLevel {
  Debug = 1,
  Log,
  Error,
  Silent = Number.POSITIVE_INFINITY,
}

type RawLogger = (...data: unknown[]) => void

export class StructuredLogger {
  private readonly fields: Record<string, unknown>
  private readonly logLevel: LogLevel
  private readonly rawLogger?: RawLogger

  constructor(logLevel: LogLevel, rawLogger?: RawLogger, fields: Record<string, unknown> = {}) {
    this.fields = fields
    this.logLevel = logLevel
    this.rawLogger = rawLogger
  }

  private doLog(message: string, level: string, defaultLogger: RawLogger) {
    const logger = this.rawLogger ?? defaultLogger

    logger(systemLogTag, JSON.stringify({ msg: message, fields: this.fields, level }))
  }

  log(message: string) {
    if (this.logLevel > LogLevel.Log) {
      return
    }

    this.doLog(message, 'log', console.log)
  }

  debug(message: string) {
    if (this.logLevel > LogLevel.Debug) {
      return
    }

    this.doLog(message, 'debug', console.debug)
  }

  error(message: string) {
    if (this.logLevel > LogLevel.Error) {
      return
    }

    this.doLog(message, 'error', console.error)
  }

  withLogLevel(level: LogLevel) {
    return new StructuredLogger(level, this.rawLogger, this.fields)
  }

  withFields(fields: Record<string, unknown>) {
    return new StructuredLogger(this.logLevel, this.rawLogger, {
      ...this.fields,
      ...fields,
    })
  }

  withError(error: unknown) {
    const fields = error instanceof Error ? serializeError(error) : { error }

    return this.withFields(fields)
  }
}

export const systemLogger = new StructuredLogger(LogLevel.Log)
