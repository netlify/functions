import type { V2Function } from '../api'
import { getHandler } from './converter'

// @ts-expect-error Expected to error because of the dangling import.
// eslint-disable-next-line import/no-unresolved, n/no-missing-import
import * as func from '#netlify-function-import'

export const handler = getHandler(func as V2Function)
