import { env } from 'process'

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
}

class SystemLogger {
  private readonly fields: Record<string, unknown>
  private readonly logLevel: LogLevel

  constructor(fields: Record<string, unknown> = {}, logLevel = LogLevel.Log) {
    this.fields = fields
    this.logLevel = logLevel
  }

  private doLog(logger: typeof console.log, message: string) {
    if (env.NETLIFY_DEV && !env.NETLIFY_ENABLE_SYSTEM_LOGGING) {
      return
    }

    logger(systemLogTag, JSON.stringify({ msg: message, fields: this.fields }))
  }

  log(message: string) {
    if (this.logLevel > LogLevel.Log) {
      return
    }

    this.doLog(console.log, message)
  }

  debug(message: string) {
    if (this.logLevel > LogLevel.Debug) {
      return
    }

    this.doLog(console.debug, message)
  }

  error(message: string) {
    if (this.logLevel > LogLevel.Error) {
      return
    }

    this.doLog(console.error, message)
  }

  withLogLevel(level: LogLevel) {
    return new SystemLogger(this.fields, level)
  }

  withFields(fields: Record<string, unknown>) {
    return new SystemLogger(
      {
        ...this.fields,
        ...fields,
      },
      this.logLevel,
    )
  }

  withError(error: unknown) {
    const fields = error instanceof Error ? serializeError(error) : { error }

    return this.withFields(fields)
  }
}

export const systemLogger = new SystemLogger()
