import process from 'node:process'

import { expect, test } from 'vitest'

import { LogLevel, systemLogger } from '../internal.js'

test('Log Level', () => {
  const originalDebug = console.debug

  const debugLogs = []
  console.debug = (...message) => debugLogs.push(message)

  systemLogger.debug('hello!')
  expect(debugLogs.length).toBe(0)

  systemLogger.withLogLevel(LogLevel.Debug).debug('hello!')
  expect(debugLogs.length).toBe(1)

  systemLogger.withLogLevel(LogLevel.Log).debug('hello!')
  expect(debugLogs.length).toBe(1)

  console.debug = originalDebug
})

test('Fields', () => {
  const originalLog = console.log
  const logs: string[][] = []
  console.log = (...message) => logs.push(message)
  systemLogger.withError(new Error('boom')).withFields({ foo: 'bar' }).log('hello!')
  expect(logs.length).toBe(1)
  expect(logs[0][0]).toBe('__nfSystemLog')
  const log = JSON.parse(logs[0][1])
  expect(log.msg).toBe('hello!')
  expect(log.fields.foo).toBe('bar')
  expect(log.fields.error).toBe('boom')
  expect(log.fields.error_stack.split('\n').length > 2).toBe(true)

  console.log = originalLog
})

test('Local Dev', () => {
  const originalLog = console.log
  const logs = []
  console.log = (...message) => logs.push(message)
  systemLogger.log('hello!')
  expect(logs.length).toBe(1)

  process.env.NETLIFY_DEV = 'true'
  systemLogger.log('hello!')
  expect(logs.length).toBe(1)

  process.env.NETLIFY_ENABLE_SYSTEM_LOGGING = 'true'
  systemLogger.log('hello!')
  expect(logs.length).toBe(2)

  delete process.env.NETLIFY_DEV
  delete process.env.NETLIFY_ENABLE_SYSTEM_LOGGING
  console.log = originalLog
})
