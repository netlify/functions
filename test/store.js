// @ts-check
const test = require('ava')
const nock = require('nock')

const { getStore } = require('..')
const { STORE_ENDPOINT } = require('../src/lib/consts')

//  Throw on invalid domain
nock.disableNetConnect()

const HOST = STORE_ENDPOINT

const context = {
  clientContext: { blobstore: { token: 'atoken' } },
}
const store = getStore(context)

const response = `{ "hello": "world" }`

const KEY = `mykey`

test.afterEach(() => {
  nock.cleanAll()
})

test('gets a value', async (t) => {
  nock(HOST).get(`/item/${KEY}`).reply(200, response)
  const value = await store.get(KEY)
  t.deepEqual(value, { hello: 'world' })
})

test('returns undefined for missing value', async (t) => {
  nock(HOST).get(`/item/invalid`).reply(404)
  const value = await store.get('invalid')
  t.is(value, undefined)
})

test('throws on network error', async (t) => {
  nock(HOST).get(`/item/network`).replyWithError('oh no')
  await t.throwsAsync(() => store.get('network'))
})

test('sets a value', async (t) => {
  nock(HOST).put(`/item/${KEY}`).reply(200)
  const value = await store.set(KEY, { hello: 1 })
  t.truthy(value)
})

test('sends the correct value', async (t) => {
  const data = { hello: 1 }

  nock(HOST).put(`/item/${KEY}`, data).reply(200)
  const value = await store.set(KEY, data)
  t.truthy(value)
})

test('throws on invalid object', async (t) => {
  nock(HOST).put(`/item/${KEY}`).reply(200)

  const circular = {
    foo: {},
  }

  circular.foo = circular

  await t.throwsAsync(
    () => store.set(KEY, circular),
    'Could not serialize value for key mykey. Item must be JSON-serializable',
  )
})

test('deletes a value', async (t) => {
  nock(HOST).delete(`/item/${KEY}`).reply(200)
  const value = await store.delete(KEY)
  t.truthy(value)
})

test('returns false when deleting non-existent key', async (t) => {
  nock(HOST).delete(`/item/invalid`).reply(404)
  const value = await store.delete('invalid')
  t.falsy(value)
})

test('throws when getting an invalid key', async (t) => {
  // @ts-ignore
  await t.throwsAsync(() => store.get({ an: 'object' }), 'Invalid key')
})

test('throws when setting an invalid key', async (t) => {
  // @ts-ignore
  await t.throwsAsync(() => store.set({ an: 'object' }, true), 'Invalid key')
})

test('throws when deleting an invalid key', async (t) => {
  // @ts-ignore
  await t.throwsAsync(() => store.get({ an: 'object' }), 'Invalid key')
})

test('sends credentials', async (t) => {
  nock(HOST, { reqheaders: { authorization: `Bearer atoken` } })
    .get(`/item/creds`)
    .reply(200, {})
  const value = await store.get('creds')
  t.truthy(value)
})
