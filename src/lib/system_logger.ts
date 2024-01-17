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
  Info,
  Warn,
  Error,
}

class SystemLogger {
  // eslint-disable-next-line no-useless-constructor
  constructor(
    private readonly fields: Record<string, unknown> = {},
    private readonly logLevel = LogLevel.Info,
  ) {}

  private doLog(logger: typeof console.log, message: string) {
    logger(systemLogTag, JSON.stringify({ msg: message, fields: this.fields }))
  }

  /**
   * Alias for .info
   */
  log(message: string) {
    this.info(message)
  }

  info(message: string) {
    if (this.logLevel > LogLevel.Info) {
      return
    }

    this.doLog(console.info, message)
  }

  debug(message: string) {
    if (this.logLevel > LogLevel.Debug) {
      return
    }

    this.doLog(console.debug, message)
  }

  warn(message: string) {
    if (this.logLevel > LogLevel.Warn) {
      return
    }

    this.doLog(console.warn, message)
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

  withRequest(req: Request) {
    // proxy automatically adds the request ID to the logs,
    // so we don't need to care about it here

    const debug = req.headers.has('x-nf-debug-logging')
    if (debug) {
      return this.withLogLevel(LogLevel.Debug)
    }

    return this
  }
}

export const systemLogger = new SystemLogger()
