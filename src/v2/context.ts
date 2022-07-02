import { Response } from 'undici'

import type { CookieStore } from './cookie_store'

const json = (input: unknown) => {
  const data = JSON.stringify(input)

  return new Response(data, {
    headers: {
      'content-type': 'application/json',
    },
  })
}

const getContext = ({ cookies }: { cookies: CookieStore }) => {
  const context = {
    cookies: cookies.getPublicInterface(),
    json,
  }

  return context
}

type Context = ReturnType<typeof getContext>

export { Context, getContext }
