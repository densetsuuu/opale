import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import { defineRouteGroup } from '#app/core/utils/index'

const { identity, core } = controllers

defineRouteGroup(() => {
  router.post('register', [identity.Auth, 'register'])
  router.post('login', [identity.Auth, 'login'])
}).use(middleware.guest())

defineRouteGroup(() => {
  router.post('logout', [identity.Auth, 'logout'])
}).use(middleware.auth())

router.get('/is-authenticated', [identity.Auth, 'isAuthenticated'])
router.get('health', [core.HealthChecks, 'handle']).use(middleware.requireSecretToken())
