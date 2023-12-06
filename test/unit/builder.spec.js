import { test } from 'vitest'

import { builder } from '../../src/main.ts'
import { invokeLambda } from '../helpers/main.js'

const METADATA_OBJECT = { metadata: { version: 1, builder_function: true, ttl: 0 } }

test('Injects the metadata object into an asynchronous handler', async (t) => {
  const originalResponse = {
    body: ':thumbsup:',
    statusCode: 200,
    ttl: 3600,
  }
  const myHandler = async () => {
    const asyncTask = new Promise((resolve) => {
      setTimeout(resolve, 0)
    })

    await asyncTask

    return originalResponse
  }
  const response = await invokeLambda(builder(myHandler))

  t.expect(response).toEqual({ ...originalResponse, metadata: { version: 1, builder_function: true, ttl: 3600 } })
})

test('Injects the metadata object into a synchronous handler', async (t) => {
  const originalResponse = {
    body: ':thumbsup:',
    statusCode: 200,
  }
  const myHandler = (event, context, callback) => {
    callback(null, originalResponse)
  }
  const response = await invokeLambda(builder(myHandler))

  t.expect(response).toEqual({ ...originalResponse, ...METADATA_OBJECT })
})

test('Injects the metadata object for non-200 responses', async (t) => {
  const originalResponse = {
    body: ':thumbsdown:',
    statusCode: 404,
  }
  const myHandler = async () => {
    const asyncTask = new Promise((resolve) => {
      setTimeout(resolve, 0)
    })

    await asyncTask

    return originalResponse
  }
  const response = await invokeLambda(builder(myHandler))

  t.expect(response).toEqual({ ...originalResponse, ...METADATA_OBJECT })
})

test('Returns a 405 error for requests using the POST method', async (t) => {
  const originalResponse = {
    body: ':thumbsup:',
    statusCode: 200,
  }
  const myHandler = async () => {
    const asyncTask = new Promise((resolve) => {
      setTimeout(resolve, 0)
    })

    await asyncTask

    return originalResponse
  }
  const response = await invokeLambda(builder(myHandler), { method: 'POST' })

  t.expect(response).toEqual({ body: 'Method Not Allowed', statusCode: 405 })
})

test('Returns a 405 error for requests using the PUT method', async (t) => {
  const originalResponse = {
    body: ':thumbsup:',
    statusCode: 200,
  }
  const myHandler = async () => {
    const asyncTask = new Promise((resolve) => {
      setTimeout(resolve, 0)
    })

    await asyncTask

    return originalResponse
  }
  const response = await invokeLambda(builder(myHandler), { method: 'PUT' })

  t.expect(response).toEqual({ body: 'Method Not Allowed', statusCode: 405 })
})

test('Returns a 405 error for requests using the DELETE method', async (t) => {
  const originalResponse = {
    body: ':thumbsup:',
    statusCode: 200,
  }
  const myHandler = async () => {
    const asyncTask = new Promise((resolve) => {
      setTimeout(resolve, 0)
    })

    await asyncTask

    return originalResponse
  }
  const response = await invokeLambda(builder(myHandler), { method: 'DELETE' })

  t.expect(response).toEqual({ body: 'Method Not Allowed', statusCode: 405 })
})

test('Returns a 405 error for requests using the PATCH method', async (t) => {
  const originalResponse = {
    body: ':thumbsup:',
    statusCode: 200,
  }
  const myHandler = async () => {
    const asyncTask = new Promise((resolve) => {
      setTimeout(resolve, 0)
    })

    await asyncTask

    return originalResponse
  }
  const response = await invokeLambda(builder(myHandler), { method: 'PATCH' })

  t.expect(response).toEqual({ body: 'Method Not Allowed', statusCode: 405 })
})

test('Preserves errors thrown inside the wrapped handler', async (t) => {
  const error = new Error('Uh-oh!')

  error.someProperty = ':thumbsdown:'

  const myHandler = async () => {
    const asyncTask = new Promise((resolve) => {
      setTimeout(resolve, 0)
    })

    await asyncTask

    throw error
  }

  await t.expect(() => invokeLambda(builder(myHandler))).rejects.toEqual(error)
})

test('Does not pass query parameters to the wrapped handler', async (t) => {
  const originalResponse = {
    body: ':thumbsup:',
    statusCode: 200,
  }
  // eslint-disable-next-line require-await
  const myHandler = async (event) => {
    t.expect(event.multiValueQueryStringParameters).toEqual({})
    t.expect(event.queryStringParameters).toEqual({})

    return originalResponse
  }
  const multiValueQueryStringParameters = { foo: ['bar'], bar: ['baz'] }
  const queryStringParameters = { foo: 'bar', bar: 'baz' }
  const response = await invokeLambda(builder(myHandler), {
    multiValueQueryStringParameters,
    queryStringParameters,
  })

  t.expect(response).toEqual({ ...originalResponse, ...METADATA_OBJECT })
})
