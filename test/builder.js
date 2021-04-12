const test = require('ava')

const { builder } = require('../src/lib/builder')

const { invokeLambda } = require('./helpers/main')

const METADATA_OBJECT = { metadata: { version: 1, builder_function: true } }

test('Injects the metadata object into an asynchronous handler', async (t) => {
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
  const response = await invokeLambda(builder(myHandler))

  t.deepEqual(response, { ...originalResponse, ...METADATA_OBJECT })
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

  t.deepEqual(response, { ...originalResponse, ...METADATA_OBJECT })
})

test('Does not inject the metadata object for non-200 responses', async (t) => {
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

  t.deepEqual(response, originalResponse)
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

  t.deepEqual(response, { body: 'Method Not Allowed', statusCode: 405 })
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

  t.deepEqual(response, { body: 'Method Not Allowed', statusCode: 405 })
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

  t.deepEqual(response, { body: 'Method Not Allowed', statusCode: 405 })
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

  t.deepEqual(response, { body: 'Method Not Allowed', statusCode: 405 })
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

  await t.throwsAsync(invokeLambda(builder(myHandler)), { is: error })
})

test('Does not pass query parameters to the wrapped handler', async (t) => {
  const originalResponse = {
    body: ':thumbsup:',
    statusCode: 200,
  }
  // eslint-disable-next-line require-await
  const myHandler = async (event) => {
    t.deepEqual(event.multiValueQueryStringParameters, {})
    t.deepEqual(event.queryStringParameters, {})

    return originalResponse
  }
  const multiValueQueryStringParameters = { foo: ['bar'], bar: ['baz'] }
  const queryStringParameters = { foo: 'bar', bar: 'baz' }
  const response = await invokeLambda(builder(myHandler), {
    multiValueQueryStringParameters,
    queryStringParameters,
  })

  t.deepEqual(response, { ...originalResponse, ...METADATA_OBJECT })
})
