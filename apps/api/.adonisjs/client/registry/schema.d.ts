/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractQuery, ExtractQueryForGet } from '@tuyau/core/types'
import type { InferInput } from '@vinejs/vine/types'

export interface Registry {
  'workload.items.index': {
    methods: ["GET"]
    pattern: '/workload-items'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
    }
  }
  'workload.items.store': {
    methods: ["POST"]
    pattern: '/workload-items'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
    }
  }
  'workload.items.show': {
    methods: ["GET"]
    pattern: '/workload-items/:id'
    types: {
      body: {}
      paramsTuple: [string]
      params: { id: string }
      query: {}
      response: unknown
    }
  }
  'workload.items.update': {
    methods: ["PUT"]
    pattern: '/workload-items/:id'
    types: {
      body: {}
      paramsTuple: [string]
      params: { id: string }
      query: {}
      response: unknown
    }
  }
  'workload.items.destroy': {
    methods: ["DELETE"]
    pattern: '/workload-items/:id'
    types: {
      body: {}
      paramsTuple: [string]
      params: { id: string }
      query: {}
      response: unknown
    }
  }
  'workload.plans.index': {
    methods: ["GET"]
    pattern: '/workload-plans'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
    }
  }
  'workload.plans.store': {
    methods: ["POST"]
    pattern: '/workload-plans'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
    }
  }
  'workload.plans.show': {
    methods: ["GET"]
    pattern: '/workload-plans/:id'
    types: {
      body: {}
      paramsTuple: [string]
      params: { id: string }
      query: {}
      response: unknown
    }
  }
  'workload.plans.update': {
    methods: ["PUT"]
    pattern: '/workload-plans/:id'
    types: {
      body: {}
      paramsTuple: [string]
      params: { id: string }
      query: {}
      response: unknown
    }
  }
  'workload.plans.destroy': {
    methods: ["DELETE"]
    pattern: '/workload-plans/:id'
    types: {
      body: {}
      paramsTuple: [string]
      params: { id: string }
      query: {}
      response: unknown
    }
  }
  'auth.register': {
    methods: ["POST"]
    pattern: '/register'
    types: {
      body: ExtractBody<InferInput<(typeof import('#app/identity/validators/user').signupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#app/identity/validators/user').signupValidator)>>
      response: Awaited<ReturnType<import('#app/identity/controllers/auth_controller').default['register']>>
    }
  }
  'auth.login': {
    methods: ["POST"]
    pattern: '/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#app/identity/validators/user').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#app/identity/validators/user').loginValidator)>>
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
  'health_checks': {
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
