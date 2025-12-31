export const controllers = {
  core: {
    HealthChecks: () => import('#app/core/controllers/health_checks_controller'),
  },
  identity: {
    Auth: () => import('#app/identity/controllers/auth_controller'),
  },
}
