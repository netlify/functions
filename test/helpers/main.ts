import { Event } from '../../src/function/event.js'

export const invokeLambda = (handler, { method = 'GET', ...options }: Partial<Event> & { method?: string } = {}) => {
  const event = {
    ...options,
    httpMethod: method,
  }

  return new Promise((resolve, reject) => {
    const callback = (error: Error, response: unknown) => {
      if (error) {
        reject(error)
      } else {
        resolve(response)
      }
    }

    resolve(handler(event, {}, callback))
  })
}
