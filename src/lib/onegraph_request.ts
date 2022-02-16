import { Buffer } from 'buffer'
import { request } from 'https'
import { env } from 'process'

const siteId = env.SITE_ID

export const oneGraphRequest = function (secretToken: string, requestBody: Uint8Array): Promise<any> {
  return new Promise((resolve, reject) => {
    const port = 443

    const options = {
      host: 'serve.onegraph.com',
      path: `/graphql?app_id=${siteId}`,
      port,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Content-Length': requestBody ? Buffer.byteLength(requestBody) : 0,
      },
    }

    const req = request(options, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(String(res.statusCode)))
      }

      const body: Array<Uint8Array> = []

      res.on('data', (chunk) => {
        body.push(chunk)
      })

      res.on('end', () => {
        const data = Buffer.concat(body).toString()
        try {
          const result = JSON.parse(data)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.write(requestBody)

    req.end()
  })
}
