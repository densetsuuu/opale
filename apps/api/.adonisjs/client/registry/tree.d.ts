/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    register: typeof routes['auth.register']
    login: typeof routes['auth.login']
    isAuthenticated: typeof routes['auth.is_authenticated']
  }
  healthChecks: typeof routes['health_checks']
}
