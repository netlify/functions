export interface Geo {
  city?: string
  country?: {
    code?: string
    name?: string
  }
  subdivision?: {
    code?: string
    name?: string
  }
}

export function parseGeoHeader(geoHeader: string | null) {
  if (geoHeader === null) {
    return {}
  }

  try {
    const geoData: Geo = JSON.parse(geoHeader)

    return geoData
  } catch {
    return {}
  }
}
