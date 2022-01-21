import type { Handler } from '../function'

/**
 * Declares a function to run on a cron schedule.
 * Not reachable via HTTP.
 *
 * @example
 * ```
 * export const handler = cron("5 4 * * *", async () => {
 *   // ...
 * })
 * ```
 *
 * @param schedule expressed as cron string. see https://crontab.guru for help.
 * @param handler
 * @see https://docs.netlify.com/functions/<schedule>
 * @tutorial https://announcement-blogpost
 */
const schedule = (cron: string, handler: Handler): Handler => handler

export { schedule }
