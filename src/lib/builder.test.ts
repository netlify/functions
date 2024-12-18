import { expect, test } from 'vitest'

import { invokeLambda } from '../../test/helpers/main.mjs'
import { BaseHandler } from '../function/handler.js'
import { HandlerEvent } from '../main.js'

import { builder } from './builder.js'

const METADATA_OBJECT = { metadata: { version: 1, builder_function: true, ttl: 0 } }

test('Injects the metadata object into an asynchronous handler', async () => {
  const ttl = 3600
  const originalResponse = {
    body: ':thumbsup:',
    statusCode: 200,
    ttl,
  }
  const myHandler = async () => {
    const asyncTask = new Promise((resolve) => {
      setTimeout(resolve, 0)
    })

    await asyncTask

    return originalResponse
  }
  const response = await invokeLambda(builder(myHandler))

  expect(response).toStrictEqual({ ...originalResponse, metadata: { version: 1, builder_function: true, ttl } })
})

test('Injects the metadata object into a synchronous handler', async () => {
  const originalResponse = {
    body: ':thumbsup:',
    statusCode: 200,
  }
  // eslint-disable-next-line promise/prefer-await-to-callbacks
  const myHandler: BaseHandler = (event, context, callback) => {
    // eslint-disable-next-line n/callback-return, promise/prefer-await-to-callbacks
    callback?.(null, originalResponse)
  }
  const response = await invokeLambda(builder(myHandler))

  expect(response).toStrictEqual({ ...originalResponse, ...METADATA_OBJECT })
})

test('Injects the metadata object for non-200 responses', async () => {
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

  expect(response).toStrictEqual({ ...originalResponse, ...METADATA_OBJECT })
})

test('Returns a 405 error for requests using the POST method', async () => {
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

  expect(response).toStrictEqual({ body: 'Method Not Allowed', statusCode: 405 })
})

test('Returns a 405 error for requests using the PUT method', async () => {
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

  expect(response).toStrictEqual({ body: 'Method Not Allowed', statusCode: 405 })
})

test('Returns a 405 error for requests using the DELETE method', async () => {
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

  expect(response).toStrictEqual({ body: 'Method Not Allowed', statusCode: 405 })
})

test('Returns a 405 error for requests using the PATCH method', async () => {
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

  expect(response).toStrictEqual({ body: 'Method Not Allowed', statusCode: 405 })
})

test('Preserves errors thrown inside the wrapped handler', async () => {
  const error = new Error('Uh-oh!')

  // @ts-expect-error There's no type for this custom property.
  error.someProperty = ':thumbsdown:'

  const myHandler = async () => {
    const asyncTask = new Promise((resolve) => {
      setTimeout(resolve, 0)
    })

    await asyncTask

    throw error
  }

  try {
    await invokeLambda(builder(myHandler))

    throw new Error('Invocation should have failed')
  } catch {}
})

test('Does not pass query parameters to the wrapped handler', async () => {
  const originalResponse = {
    body: ':thumbsup:',
    statusCode: 200,
  }
  // eslint-disable-next-line require-await
  const myHandler = async (event: HandlerEvent) => {
    expect(event.multiValueQueryStringParameters).toStrictEqual({})
    expect(event.queryStringParameters).toStrictEqual({})

    return originalResponse
  }
  const multiValueQueryStringParameters = { foo: ['bar'], bar: ['baz'] }
  const queryStringParameters = { foo: 'bar', bar: 'baz' }
  const response = await invokeLambda(builder(myHandler), {
    // @ts-expect-error TODO: Fic types.
    multiValueQueryStringParameters,
    queryStringParameters,
  })

  expect(response).toStrictEqual({ ...originalResponse, ...METADATA_OBJECT })
})
