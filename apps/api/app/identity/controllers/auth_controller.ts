import { HttpContext } from '@adonisjs/core/http'
import { Group, GroupMiddleware, Post, Get } from '@adonisjs-community/girouette'
import { middleware } from '#start/kernel'

import { loginValidator, signupValidator } from '../validators/user.ts'
import UserTransformer from '../transformers/user_transformer.ts'
import User from '../models/user.ts'

@Group({ name: 'auth' })
@GroupMiddleware(middleware.auth())
export default class AuthController {
  @Post('/register')
  async register({ request, auth }: HttpContext) {
    const payload = await request.validateUsing(signupValidator)
    const user = await User.create({ ...payload })

    await auth.use('web').login(user)
  }

  @Post('/login')
  async login({ request, auth }: HttpContext) {
    const payload = await request.validateUsing(loginValidator)
    const user = await User.verifyCredentials(payload.email, payload.password)

    await auth.use('web').login(user)
  }

  @Post('/logout')
  async logout({ auth }: HttpContext) {
    await auth.use('web').logout()
  }

  @Get('/me')
  async me({ auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()

    return await serialize(UserTransformer.transform(user))
  }

  @Get('/is_authenticated')
  async isAuthenticated({ auth }: HttpContext) {
    return { isAuthenticated: !!auth.user }
  }
}
