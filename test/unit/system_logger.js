const test = require('ava')

const { systemLogger, LogLevel, StructuredLogger } = require('../../dist/internal')

const consoleDebug = console.debug
const consoleError = console.error
const consoleLog = console.log

test.afterEach(() => {
  console.debug = consoleDebug
  console.error = consoleError
  console.log = consoleLog
})

test('Log levels', (t) => {
  const logs = {
    debug: [],
    error: [],
    log: [],
  }
  console.debug = (...message) => logs.debug.push(message)
  console.error = (...message) => logs.error.push(message)
  console.log = (...message) => logs.log.push(message)

  systemLogger.debug('debug 1')
  t.is(logs.debug.length, 0)

  systemLogger.log('log 1')
  t.is(logs.log.length, 1)

  systemLogger.withLogLevel(LogLevel.Debug).debug('debug 2')
  t.is(logs.debug.length, 1)

  systemLogger.withLogLevel(LogLevel.Debug).error('error 1')
  t.is(logs.error.length, 1)

  systemLogger.withLogLevel(LogLevel.Silent).error('error 2')
  t.is(logs.error.length, 1)
})

test('Fields', (t) => {
  const logs = []
  console.log = (...message) => logs.push(message)
  systemLogger.withError(new Error('boom')).withFields({ foo: 'bar' }).log('hello!')
  t.is(logs.length, 1)
  t.is(logs[0][0], '__nfSystemLog')
  const log = JSON.parse(logs[0][1])
  t.is(log.msg, 'hello!')
  t.is(log.fields.foo, 'bar')
  t.is(log.fields.error, 'boom')
  t.is(log.fields.error_stack.split('\n').length > 2, true)
  t.is(log.level, 'log')
})

test('Accepts a custom raw logger', (t) => {
  const logs = {
    debug: [],
    error: [],
    log: [],
  }
  console.debug = () => {
    throw new Error('Unexpected `console.debug` call')
  }
  console.error = () => {
    throw new Error('Unexpected `console.error` call')
  }
  console.log = () => {
    throw new Error('Unexpected `console.log` call')
  }
  const rawLogger = (tag, payload) => {
    t.is(tag, '__nfSystemLog')

    const { msg, fields, level } = JSON.parse(payload)
    const bucket = logs[level]

    t.truthy(bucket)

    bucket.push({ fields, msg })
  }

  const logger = new StructuredLogger(LogLevel.Log, rawLogger, {})

  logger.debug('debug 1')
  t.is(logs.debug.length, 0)

  logger.log('log 1')
  t.is(logs.log.length, 1)

  logger.withLogLevel(LogLevel.Debug).debug('debug 2')
  t.is(logs.debug.length, 1)

  logger.withLogLevel(LogLevel.Debug).error('error 1')
  t.is(logs.error.length, 1)

  logger.withLogLevel(LogLevel.Silent).error('error 2')
  t.is(logs.error.length, 1)
})
