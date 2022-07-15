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

export const parseGeoHeader = (geoHeader: string | null): Geo => {
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
