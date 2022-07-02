import { Headers } from 'undici'

const parseIP = (headers: Headers) => {
  const ip = headers.get('x-nf-client-connection-ip')

  return ip ?? ''
}

export { parseIP }
