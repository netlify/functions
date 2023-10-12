import type { getNetlifyGlobal } from '@netlify/serverless-functions-api'

export { builder } from './lib/builder.js'
export { purgeCache } from './lib/purge_cache.js'
export { schedule } from './lib/schedule.js'
export { stream } from './lib/stream.js'
export * from './function/index.js'

// Ambient type declarations
declare global {
  const Netlify: ReturnType<typeof getNetlifyGlobal>
}
