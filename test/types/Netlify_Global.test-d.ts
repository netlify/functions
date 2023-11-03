import { expectAssignable } from 'tsd'

// eslint-disable-next-line import/no-unassigned-import
import '../../src/main.js'

expectAssignable<{ env: unknown }>(Netlify)
