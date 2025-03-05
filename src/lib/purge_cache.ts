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

  const { siteID } = options as PurgeCacheOptionsWithSiteID
  const { siteSlug } = options as PurgeCacheOptionsWithSiteSlug
  const { domain } = options as PurgeCacheOptionsWithDomain

  if ((siteID && siteSlug) || (siteID && domain) || (siteSlug && domain)) {
    throw new Error('Can only pass one of either "siteID", "siteSlug", or "domain"')
  }

  const payload: PurgeAPIPayload = {
    cache_tags: options.tags,
  }

  if ('deployAlias' in options) {
    payload.deploy_alias = options.deployAlias
  } else if (!env.NETLIFY_LOCAL) {
    payload.deploy_alias = env.NETLIFY_BRANCH
  }

  const token = env.NETLIFY_PURGE_API_TOKEN || options.token

  if (env.NETLIFY_LOCAL && !token) {
    const scope = options.tags?.length ? ` for tags ${options.tags?.join(', ')}` : ''
    console.log(`Skipping purgeCache${scope} in local development.`)
    return
  }

  if (siteSlug) {
    payload.site_slug = siteSlug
  } else if (domain) {
    payload.domain = domain
  } else {
    // The `siteID` from `options` takes precedence over the one from the
    // environment.
    payload.site_id = siteID || env.SITE_ID

    if (!payload.site_id) {
      throw new Error(
        'The Netlify site ID was not found in the execution environment. Please supply it manually using the `siteID` property.',
      )
    }
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
    let text
    try {
      text = await response.text()
    } catch {}
    if (text) {
      throw new Error(`Cache purge API call was unsuccessful.\nStatus: ${response.status}\nBody: ${text}`)
    }
    throw new Error(`Cache purge API call was unsuccessful.\nStatus: ${response.status}`)
  }
}
