const process = require('process')

const test = require('ava')

const { purgeCache } = require('../../dist/lib/purge_cache')
const { invokeLambda } = require('../helpers/main')
const MockFetch = require('../helpers/mock_fetch')

const globalFetch = globalThis.fetch

test.beforeEach(() => {
  delete process.env.NETLIFY_PURGE_API_TOKEN
  delete process.env.SITE_ID
})

test.afterEach(() => {
  globalThis.fetch = globalFetch
})

test.serial('Calls the purge API endpoint and returns `undefined` if the operation was successful', async (t) => {
  const mockSiteID = '123456789'
  const mockToken = '1q2w3e4r5t6y7u8i9o0p'

  process.env.NETLIFY_PURGE_API_TOKEN = mockToken
  process.env.SITE_ID = mockSiteID

  const mockAPI = new MockFetch().post({
    body: (payload) => {
      const data = JSON.parse(payload)

      t.is(data.site_id, mockSiteID)
    },
    headers: { Authorization: `Bearer ${mockToken}` },
    method: 'post',
    response: new Response(null, { status: 202 }),
    url: `https://api.netlify.com/api/v1/purge`,
  })
  const myFunction = async () => {
    await purgeCache()
  }

  globalThis.fetch = mockAPI.fetcher

  const response = await invokeLambda(myFunction)

  t.is(response, undefined)
  t.true(mockAPI.fulfilled)
})

test.serial('Throws if the API response does not have a successful status code', async (t) => {
  const mockSiteID = '123456789'
  const mockToken = '1q2w3e4r5t6y7u8i9o0p'

  process.env.NETLIFY_PURGE_API_TOKEN = mockToken
  process.env.SITE_ID = mockSiteID

  const mockAPI = new MockFetch().post({
    body: (payload) => {
      const data = JSON.parse(payload)

      t.is(data.site_id, mockSiteID)
    },
    headers: { Authorization: `Bearer ${mockToken}` },
    method: 'post',
    response: new Response(null, { status: 500 }),
    url: `https://api.netlify.com/api/v1/purge`,
  })
  const myFunction = async () => {
    await purgeCache()
  }

  globalThis.fetch = mockAPI.fetcher

  await t.throwsAsync(
    async () => await invokeLambda(myFunction),
    'Cache purge API call returned an unexpected status code: 500',
  )
})
