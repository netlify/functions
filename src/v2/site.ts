import { env } from 'process'

interface Site {
  id?: string
  name?: string
  url?: string
}

function getSiteObject(): Site {
  const site = {
    id: env.SITE_ID,
    name: env.SITE_NAME,
    url: env.URL,
  }

  return site
}

export { getSiteObject, Site }
