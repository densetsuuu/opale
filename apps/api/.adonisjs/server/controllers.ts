export const controllers = {
  core: {
    HealthChecks: () => import('#app/core/controllers/health_checks_controller'),
  },
  identity: {
    Auth: () => import('#app/identity/controllers/auth_controller'),
  },
  workload: {
    WorkloadItems: () => import('#app/workload/controllers/workload_items_controller'),
    WorkloadPlans: () => import('#app/workload/controllers/workload_plans_controller'),
  },
}
