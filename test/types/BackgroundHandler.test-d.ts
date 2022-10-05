import { expectType } from 'tsd'

import { BackgroundHandler } from '../../src/main.js'

// Ensure void is a valid return type in async handlers
const handler: BackgroundHandler = async () => {
  // void
}

expectType<BackgroundHandler>(handler)
