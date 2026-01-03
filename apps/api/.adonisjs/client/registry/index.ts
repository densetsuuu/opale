/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'workload.items.index': {
    methods: ["GET"],
    pattern: '/workload-items',
    tokens: [{"old":"/workload-items","type":0,"val":"workload-items","end":""}],
    types: placeholder as Registry['workload.items.index']['types'],
  },
  'workload.items.store': {
    methods: ["POST"],
    pattern: '/workload-items',
    tokens: [{"old":"/workload-items","type":0,"val":"workload-items","end":""}],
    types: placeholder as Registry['workload.items.store']['types'],
  },
  'workload.items.show': {
    methods: ["GET"],
    pattern: '/workload-items/:id',
    tokens: [{"old":"/workload-items/:id","type":0,"val":"workload-items","end":""},{"old":"/workload-items/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['workload.items.show']['types'],
  },
  'workload.items.update': {
    methods: ["PUT"],
    pattern: '/workload-items/:id',
    tokens: [{"old":"/workload-items/:id","type":0,"val":"workload-items","end":""},{"old":"/workload-items/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['workload.items.update']['types'],
  },
  'workload.items.destroy': {
    methods: ["DELETE"],
    pattern: '/workload-items/:id',
    tokens: [{"old":"/workload-items/:id","type":0,"val":"workload-items","end":""},{"old":"/workload-items/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['workload.items.destroy']['types'],
  },
  'workload.plans.index': {
    methods: ["GET"],
    pattern: '/workload-plans',
    tokens: [{"old":"/workload-plans","type":0,"val":"workload-plans","end":""}],
    types: placeholder as Registry['workload.plans.index']['types'],
  },
  'workload.plans.store': {
    methods: ["POST"],
    pattern: '/workload-plans',
    tokens: [{"old":"/workload-plans","type":0,"val":"workload-plans","end":""}],
    types: placeholder as Registry['workload.plans.store']['types'],
  },
  'workload.plans.show': {
    methods: ["GET"],
    pattern: '/workload-plans/:id',
    tokens: [{"old":"/workload-plans/:id","type":0,"val":"workload-plans","end":""},{"old":"/workload-plans/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['workload.plans.show']['types'],
  },
  'workload.plans.update': {
    methods: ["PUT"],
    pattern: '/workload-plans/:id',
    tokens: [{"old":"/workload-plans/:id","type":0,"val":"workload-plans","end":""},{"old":"/workload-plans/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['workload.plans.update']['types'],
  },
  'workload.plans.destroy': {
    methods: ["DELETE"],
    pattern: '/workload-plans/:id',
    tokens: [{"old":"/workload-plans/:id","type":0,"val":"workload-plans","end":""},{"old":"/workload-plans/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['workload.plans.destroy']['types'],
  },
  'auth.register': {
    methods: ["POST"],
    pattern: '/register',
    tokens: [{"old":"/register","type":0,"val":"register","end":""}],
    types: placeholder as Registry['auth.register']['types'],
  },
  'auth.login': {
    methods: ["POST"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.login']['types'],
  },
  'auth.logout': {
    methods: ["POST"],
    pattern: '/logout',
    tokens: [{"old":"/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['auth.logout']['types'],
  },
  'auth.is_authenticated': {
    methods: ["GET","HEAD"],
    pattern: '/is-authenticated',
    tokens: [{"old":"/is-authenticated","type":0,"val":"is-authenticated","end":""}],
    types: placeholder as Registry['auth.is_authenticated']['types'],
  },
  'health_checks': {
    methods: ["GET","HEAD"],
    pattern: '/health',
    tokens: [{"old":"/health","type":0,"val":"health","end":""}],
    types: placeholder as Registry['health_checks']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
