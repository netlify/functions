import process from 'node:process'

import semver from 'semver'
import { beforeEach, afterEach, expect, test } from 'vitest'

import { invokeLambda } from '../../test/helpers/main.mjs'
import { MockFetch } from '../../test/helpers/mock_fetch.mjs'

import { purgeCache } from './purge_cache.js'

const globalFetch = globalThis.fetch
const hasFetchAPI = semver.gte(process.version, '18.0.0')

beforeEach(() => {
  delete process.env.NETLIFY_PURGE_API_TOKEN
  delete process.env.SITE_ID
  delete process.env.NETLIFY_LOCAL
})

afterEach(() => {
  globalThis.fetch = globalFetch
})

test('Calls the purge API endpoint and returns `undefined` if the operation was successful', async () => {
  if (!hasFetchAPI) {
    console.warn('Skipping test requires the fetch API')

    return
  }

  const mockSiteID = '123456789'
  const mockToken = '1q2w3e4r5t6y7u8i9o0p'

  process.env.NETLIFY_PURGE_API_TOKEN = mockToken
  process.env.SITE_ID = mockSiteID

  const mockAPI = new MockFetch().post({
    body: (payload: string) => {
      const data = JSON.parse(payload)

      expect(data.site_id).toBe(mockSiteID)
    },
    headers: { Authorization: `Bearer ${mockToken}` },
    method: 'post',
    response: new Response(null, { status: 202 }),
    url: `https://api.netlify.com/api/v1/purge`,
  })
  // eslint-disable-next-line unicorn/consistent-function-scoping
  const myFunction = async () => {
    await purgeCache()
  }

  globalThis.fetch = mockAPI.fetcher

  const response = await invokeLambda(myFunction)

  expect(response).toBeUndefined()
  expect(mockAPI.fulfilled).toBeTruthy()
})

test('Throws if the API response does not have a successful status code', async () => {
  if (!hasFetchAPI) {
    console.warn('Skipping test requires the fetch API')
  }

  const mockSiteID = '123456789'
  const mockToken = '1q2w3e4r5t6y7u8i9o0p'

  process.env.NETLIFY_PURGE_API_TOKEN = mockToken
  process.env.SITE_ID = mockSiteID

  const mockAPI = new MockFetch().post({
    body: (payload: string) => {
      const data = JSON.parse(payload)

      expect(data.site_id).toBe(mockSiteID)
    },
    headers: { Authorization: `Bearer ${mockToken}` },
    method: 'post',
    response: new Response(null, { status: 500 }),
    url: `https://api.netlify.com/api/v1/purge`,
  })
  // eslint-disable-next-line unicorn/consistent-function-scoping
  const myFunction = async () => {
    await purgeCache()
  }

  globalThis.fetch = mockAPI.fetcher

  try {
    await invokeLambda(myFunction)

    throw new Error('Invocation should have failed')
  } catch (error) {
    expect((error as NodeJS.ErrnoException).message).toBe(
      'Cache purge API call returned an unexpected status code: 500',
    )
  }
})

test('Ignores purgeCache if in local dev with no token or site', async () => {
  if (!hasFetchAPI) {
    console.warn('Skipping test requires the fetch API')

    return
  }

  process.env.NETLIFY_LOCAL = '1'

  const mockAPI = new MockFetch().post({
    body: () => {
      throw new Error('Unexpected request')
    },
  })
  // eslint-disable-next-line unicorn/consistent-function-scoping
  const myFunction = async () => {
    await purgeCache()
  }

  globalThis.fetch = mockAPI.fetcher

  const response = await invokeLambda(myFunction)

  expect(response).toBeUndefined()
})

test('Accepts a custom user-agent', async () => {
  if (!hasFetchAPI) {
    console.warn('Skipping test requires the fetch API')

    return
  }

  const userAgent = 'Netlify'
  const mockSiteID = '123456789'
  const mockToken = '1q2w3e4r5t6y7u8i9o0p'

  process.env.NETLIFY_PURGE_API_TOKEN = mockToken
  process.env.SITE_ID = mockSiteID

  const mockAPI = new MockFetch().post({
    body: (payload: string) => {
      const data = JSON.parse(payload)

      expect(data.site_id).toBe(mockSiteID)
    },
    headers: { Authorization: `Bearer ${mockToken}`, 'user-agent': userAgent },
    method: 'post',
    response: new Response(null, { status: 202 }),
    url: `https://api.netlify.com/api/v1/purge`,
  })

  const myFunction = async () => {
    await purgeCache({ userAgent })
  }

  globalThis.fetch = mockAPI.fetcher

  const response = await invokeLambda(myFunction)

  expect(response).toBeUndefined()
  expect(mockAPI.fulfilled).toBeTruthy()
})
