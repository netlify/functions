/* eslint-disable no-use-before-define */
import type { Request, Response } from './base'
import { Cookie, deleteCookie, getCookies, setCookie } from '../vendor/std/http/cookie'

interface Cookies {
  delete: CookieStore['delete']
  get: CookieStore['get']
  set: CookieStore['set']
}

interface DeleteCookieOp {
  options: DeleteCookieOptions
  type: 'delete'
}

interface DeleteCookieOptions {
  domain?: string
  name: string
  path?: string
}

interface SetCookieOp {
  cookie: Cookie
  type: 'set'
}

class CookieStore {
  ops: (DeleteCookieOp | SetCookieOp)[]
  request: Request

  constructor(request: Request) {
    this.ops = []
    this.request = request
  }

  apply(response: Response) {
    this.ops.forEach((op) => {
      switch (op.type) {
        case 'delete':
          deleteCookie(response.headers, op.options.name, {
            domain: op.options.domain,
            path: op.options.path,
          })

          break

        case 'set':
          setCookie(response.headers, op.cookie)

          break

        default:
      }
    })
  }

  delete(input: string | DeleteCookieOptions) {
    const defaultOptions = {
      path: '/',
    }
    const options = typeof input === 'string' ? { name: input } : input

    this.ops.push({
      options: { ...defaultOptions, ...options },
      type: 'delete',
    })
  }

  get(name: string) {
    return getCookies(this.request.headers)[name]
  }

  getPublicInterface(): Cookies {
    return {
      delete: this.delete.bind(this),
      get: this.get.bind(this),
      set: this.set.bind(this),
    }
  }

  set(cookie: Cookie) {
    this.ops.push({ cookie, type: 'set' })
  }
}

export { CookieStore }
export type { Cookies }
/* eslint-enable no-use-before-define */
