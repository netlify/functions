import process from 'process'

import semver from 'semver'
import { test, beforeEach, afterEach } from 'vitest'

import { purgeCache } from '../../src/main.ts'
import { invokeLambda } from '../helpers/main.js'
import MockFetch from '../helpers/mock_fetch.js'

const globalFetch = globalThis.fetch
const hasFetchAPI = semver.gte(process.version, '18.0.0')

beforeEach(() => {
  delete process.env.NETLIFY_PURGE_API_TOKEN
  delete process.env.SITE_ID
})

afterEach(() => {
  globalThis.fetch = globalFetch
})

test.sequential('Calls the purge API endpoint and returns `undefined` if the operation was successful', async (t) => {
  if (!hasFetchAPI) {
    console.warn('Skipping test requires the fetch API')
    return t.skip()
  }

  const mockSiteID = '123456789'
  const mockToken = '1q2w3e4r5t6y7u8i9o0p'

  process.env.NETLIFY_PURGE_API_TOKEN = mockToken
  process.env.SITE_ID = mockSiteID

  const mockAPI = new MockFetch().post({
    body: (payload) => {
      const data = JSON.parse(payload)

      t.expect(data.site_id).toEqual(mockSiteID)
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

  t.expect(response).toBeUndefined()
  t.expect(mockAPI.fulfilled).toBe(true)
})

test.sequential('Throws if the API response does not have a successful status code', async (t) => {
  if (!hasFetchAPI) {
    console.warn('Skipping test requires the fetch API')

    return t.skip()
  }

  const mockSiteID = '123456789'
  const mockToken = '1q2w3e4r5t6y7u8i9o0p'

  process.env.NETLIFY_PURGE_API_TOKEN = mockToken
  process.env.SITE_ID = mockSiteID

  const mockAPI = new MockFetch().post({
    body: (payload) => {
      const data = JSON.parse(payload)

      t.expect(data.site_id).toEqual(mockSiteID)
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

  await t
    .expect(async () => await invokeLambda(myFunction))
    .rejects.toThrowError('Cache purge API call returned an unexpected status code: 500')
})
