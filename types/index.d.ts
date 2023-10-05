import type { getNetlifyGlobal } from '@netlify/serverless-functions-api'

// Ambient type declarations
declare global {
  const Netlify: ReturnType<typeof getNetlifyGlobal>
}
