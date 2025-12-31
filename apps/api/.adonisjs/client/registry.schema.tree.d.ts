/* eslint-disable prettier/prettier */
import type { routes } from './registry.ts'

export interface ApiDefinition {
  auth: {
    register: typeof routes['auth.register']
    login: typeof routes['auth.login']
    logout: typeof routes['auth.logout']
    getMe: typeof routes['auth.get_me']
    isAuthenticated: typeof routes['auth.is_authenticated']
  }
  healthChecks: {
    handle: typeof routes['health_checks.handle']
  }
}
