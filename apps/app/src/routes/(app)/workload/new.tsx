import { createFileRoute } from '@tanstack/react-router'

import { redirectToLoginIfNotAuthenticated } from '@/hooks/auth'

export const Route = createFileRoute('/(app)/workload/new')({
  component: RouteComponent,
  beforeLoad: async () => await redirectToLoginIfNotAuthenticated(),
})

function RouteComponent() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Nouveau plan de charge</h1>
      <p>Formulaire de création à venir...</p>
    </div>
  )
}
