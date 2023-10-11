import { env } from 'process'

interface PurgeCacheOptions {
  apiURL?: string
  siteID?: string
  tags: string[]
  token?: string
}

export const purgeCache = ({ tags, ...overrides }: PurgeCacheOptions) => {
  if (globalThis.fetch === undefined) {
    throw new Error(
      "`fetch` is not available. Please ensure you're using Node.js version 18.0.0 or above. Refer to https://ntl.fyi/functions-runtime for more information.",
    )
  }

  const siteID = env.SITE_ID || overrides.siteID

  if (!siteID) {
    throw new Error(
      'The Netlify site ID was not found in the execution environment. Please supply it manually using the `siteID` property.',
    )
  }

  const token = env.NETLIFY_PURGE_TOKEN_1 || overrides.token

  if (!token) {
    throw new Error(
      'The cache purge API token was not found in the execution environment. Please supply it manually using the `token` property.',
    )
  }

  const apiURL = overrides.apiURL || 'https://api.netlify.com'

  return fetch(`${apiURL}/api/v1/purge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf8',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      site_id: siteID,
      cache_tags: [tags],
    }),
  })
}
