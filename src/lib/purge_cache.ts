import { env } from 'process'

interface BasePurgeCacheOptions {
  apiURL?: string
  deployAlias?: string
  tags?: string[]
  token?: string
  userAgent?: string
}

interface PurgeCacheOptionsWithSiteID extends BasePurgeCacheOptions {
  siteID?: string
}

interface PurgeCacheOptionsWithSiteSlug extends BasePurgeCacheOptions {
  siteSlug: string
}

interface PurgeCacheOptionsWithDomain extends BasePurgeCacheOptions {
  domain: string
}

type PurgeCacheOptions = PurgeCacheOptionsWithSiteID | PurgeCacheOptionsWithSiteSlug | PurgeCacheOptionsWithDomain

interface PurgeAPIPayload {
  cache_tags?: string[]
  deploy_alias?: string
  domain?: string
  site_id?: string
  site_slug?: string
}

// eslint-disable-next-line complexity
export const purgeCache = async (options: PurgeCacheOptions = {}) => {
  if (globalThis.fetch === undefined) {
    throw new Error(
      "`fetch` is not available. Please ensure you're using Node.js version 18.0.0 or above. Refer to https://ntl.fyi/functions-runtime for more information.",
    )
  }

  const payload: PurgeAPIPayload = {
    cache_tags: options.tags,
    deploy_alias: options.deployAlias,
  }
  const token = env.NETLIFY_PURGE_API_TOKEN || options.token

  if (env.NETLIFY_LOCAL && !token) {
    const scope = options.tags?.length ? ` for tags ${options.tags?.join(', ')}` : ''
    console.log(`Skipping purgeCache${scope} in local development.`)
    return
  }

  if ('siteSlug' in options) {
    payload.site_slug = options.siteSlug
  } else if ('domain' in options) {
    payload.domain = options.domain
  } else {
    // The `siteID` from `options` takes precedence over the one from the
    // environment.
    const siteID = options.siteID || env.SITE_ID

    if (!siteID) {
      throw new Error(
        'The Netlify site ID was not found in the execution environment. Please supply it manually using the `siteID` property.',
      )
    }

    payload.site_id = siteID
  }

  if (!token) {
    throw new Error(
      'The cache purge API token was not found in the execution environment. Please supply it manually using the `token` property.',
    )
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf8',
    Authorization: `Bearer ${token}`,
  }

  if (options.userAgent) {
    headers['user-agent'] = options.userAgent
  }

  const apiURL = options.apiURL || 'https://api.netlify.com'
  const response = await fetch(`${apiURL}/api/v1/purge`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Cache purge API call returned an unexpected status code: ${response.status}`)
  }
}
