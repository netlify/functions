import { env } from 'process'

import fetch from 'node-fetch'

interface EmailRequestOptions<T> {
  from: string
  to: string
  subject: string
  body: T
}

export const sendEmail = async <T>(template: string, { from, to, subject, body }: EmailRequestOptions<T>) => {
  if (typeof window !== 'undefined') {
    throw new TypeError('Netlify Emails is not available in the browser, please use a Netlify Function')
  }

  if (!env.NETLIFY_EMAILS_SECRET) {
    throw new Error('It does not look like Netlify Emails is enabled for this site.')
  }

  await fetch(`${env.URL}/.netlify/functions/emails/${template}`, {
    headers: {
      'netlify-emails-secret': env.NETLIFY_EMAILS_SECRET || '',
    },
    method: 'POST',
    body: JSON.stringify({
      from,
      to,
      subject,
      parameters: body,
    }),
  })
}
