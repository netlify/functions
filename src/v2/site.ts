import { env } from 'process'

interface Site {
  id?: string
  name?: string
  url?: string
}

const getSiteObject = (): Site => {
  const site = {
    id: env.SITE_ID,
    name: env.SITE_NAME,
    url: env.URL,
  }

  delete env.SITE_ID
  delete env.SITE_NAME
  delete env.UR

  return site
}

export { getSiteObject, Site }
