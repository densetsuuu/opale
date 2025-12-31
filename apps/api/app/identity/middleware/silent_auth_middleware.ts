import type { NextFn } from '@adonisjs/core/types/http'
import type { HttpContext } from '@adonisjs/core/http'

import { Monocle } from '@monocle-app/agent'

/**
 * Silent auth middleware can be used as a global middleware to silent check
 * if the user is logged-in or not.
 *
 * The request continues as usual, even when the user is not logged-in.
 */
export default class SilentAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    await ctx.auth.check()

    if (ctx.auth.user)
      Monocle.setUser({
        id: ctx.auth.user.id,
        email: ctx.auth.user.email,
        name: ctx.auth.user.fullName!,
      })

    return next()
  }
}
