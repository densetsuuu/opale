/* eslint-disable prettier/prettier */
/// <reference path="../../adonisrc.ts" />

import type { ExtractBody, ExtractQuery } from '@tuyau/core/types'
import type { Infer } from '@vinejs/vine/types'

export interface Registry {
  'auth.register': {
    methods: ["POST"]
    pattern: '/register'
    types: {
      body: ExtractBody<Infer<(typeof import('#app/identity/validators/user').signupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<Infer<(typeof import('#app/identity/validators/user').signupValidator)>>
      response: Awaited<ReturnType<import('#app/identity/controllers/auth_controller').default['register']>>
    }
  }
  'auth.login': {
    methods: ["POST"]
    pattern: '/login'
    types: {
      body: ExtractBody<Infer<(typeof import('#app/identity/validators/user').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<Infer<(typeof import('#app/identity/validators/user').loginValidator)>>
      response: Awaited<ReturnType<import('#app/identity/controllers/auth_controller').default['login']>>
    }
  }
  'auth.logout': {
    methods: ["POST"]
    pattern: '/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: Awaited<ReturnType<import('#app/identity/controllers/auth_controller').default['logout']>>
    }
  }
  'auth.get_me': {
    methods: ["GET","HEAD"]
    pattern: '/me'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: Awaited<ReturnType<import('#app/identity/controllers/auth_controller').default['getMe']>>
    }
  }
  'auth.is_authenticated': {
    methods: ["GET","HEAD"]
    pattern: '/is-authenticated'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: Awaited<ReturnType<import('#app/identity/controllers/auth_controller').default['isAuthenticated']>>
    }
  }
  'health_checks.handle': {
    methods: ["GET","HEAD"]
    pattern: '/health'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: Awaited<ReturnType<import('#app/core/controllers/health_checks_controller').default['handle']>>
    }
  }
}
