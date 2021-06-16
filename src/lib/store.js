// @ts-check

const { default: fetch } = require('node-fetch')

const { STORE_ENDPOINT } = require('./consts')

const isValidKey = (key) => key && typeof key === 'string'

/**
 * A key-value store object. Expects a context with `context.clientContext.store.token`
 *
 * @param {import("../..").HandlerContext} context
 * @returns Promise<Store>
 */
module.exports.getStore = function getStore(context) {
  const headers = { authorization: `Bearer ${context.clientContext.store.token}` }
  return {
    async get(key) {
      if (!isValidKey(key)) {
        throw new Error('Invalid key')
      }
      const response = await fetch(`${STORE_ENDPOINT}/item/${encodeURIComponent(key)}`, { headers })
      if (response.status === 404) {
        return
      }
      if (!response.ok) {
        throw new Error(`There was an error loading the value for key ${key}: ${response.statusText}`)
      }
      try {
        return response.json()
      } catch (error) {
        throw new Error(`Error parsing value for key ${key}`)
      }
    },
    async set(key, value) {
      if (!isValidKey(key)) {
        throw new Error('Invalid key')
      }

      let body
      try {
        body = JSON.stringify(value)
      } catch (error) {
        throw new Error(`Could not serialize value for key ${key}. Item must be JSON-serializable`)
      }
      const response = await fetch(`${STORE_ENDPOINT}/item/${encodeURIComponent(key)}`, {
        method: 'PUT',
        headers,
        body,
      })
      if (!response.ok) {
        throw new Error(`There was an error setting key ${key}: ${response.statusText}`)
      }
      return true
    },

    async delete(key) {
      if (!isValidKey(key)) {
        throw new Error('Invalid key')
      }

      const response = await fetch(`${STORE_ENDPOINT}/item/${encodeURIComponent(key)}`, { method: 'DELETE', headers })

      if (response.status === 404) {
        return false
      }

      if (!response.ok) {
        throw new Error(`There was an error setting key ${key}: ${response.statusText}`)
      }
      return true
    },

    async list(prefix) {
      if (!isValidKey(prefix)) {
        throw new Error('Invalid key')
      }
      const response = await fetch(`${STORE_ENDPOINT}/list/${encodeURIComponent(prefix)}`, { headers })
      if (response.status === 404) {
        return []
      }
      if (!response.ok) {
        throw new Error(`There was an error loading the value for prefix ${prefix}: ${response.statusText}`)
      }
      try {
        return response.json()
      } catch (error) {
        throw new Error(`Error parsing value for key ${prefix}`)
      }
    },
  }
}
