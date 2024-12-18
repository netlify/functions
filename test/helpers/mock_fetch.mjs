import assert from "node:assert"

export class MockFetch {
  constructor() {
    this.requests = []
  }

  addExpectedRequest({ body, headers = {}, method, response, url }) {
    this.requests.push({ body, fulfilled: false, headers, method, response, url })

    return this
  }

  delete(options) {
    return this.addExpectedRequest({ ...options, method: 'delete' })
  }

  get(options) {
    return this.addExpectedRequest({ ...options, method: 'get' })
  }

  post(options) {
    return this.addExpectedRequest({ ...options, method: 'post' })
  }

  put(options) {
    return this.addExpectedRequest({ ...options, method: 'put' })
  }

  get fetcher() {
    // eslint-disable-next-line require-await
    return async (...args) => {
      const [url, options] = args
      const headers = options?.headers
      const urlString = url.toString()
      const match = this.requests.find(
        (request) =>
          request.method.toLowerCase() === options?.method.toLowerCase() &&
          request.url === urlString &&
          !request.fulfilled,
      )

      if (!match) {
        throw new Error(`Unexpected fetch call: ${url}`)
      }

      for (const key in match.headers) {
        assert.equal(headers[key], match.headers[key])
      }

      if (typeof match.body === 'string') {
        assert.equal(options?.body, match.body)
      } else if (typeof match.body === 'function') {
        const bodyFn = match.body

        bodyFn(options?.body)
      } else {
        assert.equal(options?.body, undefined)
      }

      match.fulfilled = true

      if (match.response instanceof Error) {
        throw match.response
      }

      return match.response
    }
  }

  get fulfilled() {
    return this.requests.every((request) => request.fulfilled)
  }
}
