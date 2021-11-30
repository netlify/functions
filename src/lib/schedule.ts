import type { Handler, HandlerContext, HandlerEvent } from '../function'

type HandlerWithoutResponse = (event: HandlerEvent, context: HandlerContext) => Promise<void>

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
const schedule =
  (cron: string, handler: HandlerWithoutResponse): Handler =>
  async (event, context) => {
    try {
      await handler(event, context)
      return {
        statusCode: 200,
      }
    } catch (error) {
      return {
        statusCode: 500,
        body: String(error),
      }
    }
  }

export { schedule }
