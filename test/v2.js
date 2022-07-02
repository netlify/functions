const test = require('ava')

const { getHandler, Response } = require('../dist/main')

const { invokeLambda } = require('./helpers/main')

test('Returns a response from a `Response` object', async (t) => {
  const v2Func = {
    default: async () => new Response('Hello world'),
  }
  const v1Func = getHandler(v2Func)
  const response = await invokeLambda(v1Func)

  t.is(response.body, 'Hello world')
  t.is(response.statusCode, 200)
})

test('Returns a JSON-stringified response created with `context.json`', async (t) => {
  const v2Func = {
    default: async (_, context) => context.json({ msg: 'Hello world' }),
  }
  const v1Func = getHandler(v2Func)
  const response = await invokeLambda(v1Func)

  t.deepEqual(JSON.parse(response.body), { msg: 'Hello world' })
  t.is(response.headers['content-type'], 'application/json')
  t.is(response.statusCode, 200)
})

test('`context.cookies.get` reads a cookie from the request', async (t) => {
  const v2Func = {
    default: async (_, context) =>
      context.json({
        cookie: context.cookies.get('foo'),
      }),
  }
  const v1Func = getHandler(v2Func)
  const response = await invokeLambda(v1Func, { headers: { cookie: 'foo=monster' } })

  t.deepEqual(JSON.parse(response.body), { cookie: 'monster' })
  t.is(response.headers['content-type'], 'application/json')
  t.is(response.statusCode, 200)
})

test('`context.cookies.set` adds a cookie to the response', async (t) => {
  const v2Func = {
    default: async (_, context) => {
      context.cookies.set({ name: 'new-cookie', value: 'super-flavour' })

      return new Response('New cookie in the jar')
    },
  }
  const v1Func = getHandler(v2Func)
  const response = await invokeLambda(v1Func)

  t.deepEqual(response.body, 'New cookie in the jar')
  t.is(response.headers['set-cookie'], 'new-cookie=super-flavour')
  t.is(response.statusCode, 200)
})
