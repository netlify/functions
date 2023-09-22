export type { Context } from '@netlify/serverless-functions-api'

type Path = `/${string}`

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS'

type CronSchedule = string

export interface Config {
  path?: Path | Path[]
  method?: HTTPMethod | HTTPMethod[]
  schedule?: CronSchedule
}
