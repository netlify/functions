import { getHandler } from './converter'

// eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-unresolved
const func = require('#netlify-function-import')

export const handler = getHandler(func)
