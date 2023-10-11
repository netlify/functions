import { env } from 'process'

interface BasePurgeCacheOptions {
  apiURL?: string
  tags?: string[]
  token?: string
}

interface PurgeCacheOptionsWithSiteID extends BasePurgeCacheOptions {
  deployAlias?: string
  siteID?: string
}

interface PurgeCacheOptionsWithSiteSlug extends BasePurgeCacheOptions {
  deployAlias?: string
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

export const purgeCache = (options: PurgeCacheOptions = {}) => {
  if (globalThis.fetch === undefined) {
    throw new Error(
      "`fetch` is not available. Please ensure you're using Node.js version 18.0.0 or above. Refer to https://ntl.fyi/functions-runtime for more information.",
    )
  }

  const payload: PurgeAPIPayload = {
    cache_tags: options.tags,
    site_id: env.SITE_ID,
  }
  const token = env.NETLIFY_PURGE_API_TOKEN || options.token

  if ('siteSlug' in options) {
    payload.deploy_alias = options.deployAlias
    payload.site_slug = options.siteSlug
  } else if ('domain' in options) {
    payload.domain = options.domain
  } else {
    // The `siteID` from `options` takes precedence over the one from the
    // environment.
    if (options.siteID) {
      payload.site_id = options.siteID
    }

    payload.deploy_alias = options.deployAlias
  }

  if (!payload.site_id) {
    throw new Error(
      'The Netlify site ID was not found in the execution environment. Please supply it manually using the `siteID` property.',
    )
  }

  if (!token) {
    throw new Error(
      'The cache purge API token was not found in the execution environment. Please supply it manually using the `token` property.',
    )
  }

  const apiURL = options.apiURL || 'https://api.netlify.com'

  return fetch(`${apiURL}/api/v1/purge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf8',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
}
