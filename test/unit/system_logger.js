const { version } = require('process')

const test = require('ava')

const { systemLogger, LogLevel } = require('../../dist/internal')

test('Log Level', (t) => {
  // Request is not available in Node 14
  if (version.startsWith('v14')) {
    return t.pass()
  }

  const originalLog = console.info
  const originalDebug = console.debug

  const infoLogs = []
  const debugLogs = []
  console.info = (...message) => infoLogs.push(message)
  console.debug = (...message) => debugLogs.push(message)

  systemLogger.debug('hello!')
  t.is(debugLogs.length, 0)

  systemLogger.withLogLevel(LogLevel.Debug).debug('hello!')
  t.is(debugLogs.length, 1)

  systemLogger.withRequest(new Request('https://example.com')).debug('hello!')
  t.is(debugLogs.length, 1)

  systemLogger
    .withRequest(new Request('https://example.com', { headers: { 'x-nf-debug-logging': '1' } }))
    .debug('hello!')
  t.is(debugLogs.length, 2)

  systemLogger.withLogLevel(LogLevel.Info).debug('hello!')
  t.is(debugLogs.length, 2)

  console.info = originalLog
  console.debug = originalDebug
})

test('Fields', (t) => {
  const originalLog = console.info
  const logs = []
  console.info = (...message) => logs.push(message)
  systemLogger.withError(new Error('boom')).withFields({ foo: 'bar' }).log('hello!')
  t.is(logs.length, 1)
  t.is(logs[0][0], '__nfSystemLog')
  const log = JSON.parse(logs[0][1])
  t.is(log.msg, 'hello!')
  t.is(log.fields.foo, 'bar')
  t.is(log.fields.error, 'boom')
  t.is(log.fields.error_stack.split('\n').length > 2, true)

  console.info = originalLog
})
