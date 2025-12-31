import type { NextFn } from '@adonisjs/core/types/http'
import type { HttpContext } from '@adonisjs/core/http'

import { Exception } from '@adonisjs/core/exceptions'
import env from '#start/env'

export default class RequireSecretToken {
  async handle(ctx: HttpContext, next: NextFn) {
    const secret = ctx.request.header('x-secret-token')
    if (!secret) {
      throw new Exception('Missing authorization header', { code: 'E_AUTH_MISSING', status: 401 })
    }

    if (secret !== env.get('SECRET_TOKEN')) {
      throw new Exception('Invalid authorization header', { code: 'E_AUTH_INVALID', status: 401 })
    }

    return next()
  }
}
