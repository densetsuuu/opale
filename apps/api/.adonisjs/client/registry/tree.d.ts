/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  workload: {
    items: {
      index: typeof routes['workload.items.index']
      store: typeof routes['workload.items.store']
      show: typeof routes['workload.items.show']
      update: typeof routes['workload.items.update']
      destroy: typeof routes['workload.items.destroy']
    }
    plans: {
      index: typeof routes['workload.plans.index']
      store: typeof routes['workload.plans.store']
      show: typeof routes['workload.plans.show']
      update: typeof routes['workload.plans.update']
      destroy: typeof routes['workload.plans.destroy']
    }
  }
  auth: {
    register: typeof routes['auth.register']
    login: typeof routes['auth.login']
    logout: typeof routes['auth.logout']
    isAuthenticated: typeof routes['auth.is_authenticated']
  }
  healthChecks: typeof routes['health_checks']
}
