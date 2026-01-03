import { Plus } from 'lucide-react'
import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'

import { getMeQueryOptions, redirectToLoginIfNotAuthenticated } from '@/hooks/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/(app)/workload/')({
  component: RouteComponent,
  beforeLoad: async () => await redirectToLoginIfNotAuthenticated(),
})

function RouteComponent() {
  useSuspenseQuery(getMeQueryOptions())

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Plans de charge</h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos plans de charge et allocations de ressources
          </p>
        </div>
        <Button className="corner-squircle rounded-4xl">
          <Plus className="size-4" />
          Nouveau plan
        </Button>
      </div>

      <Card className="corner-squircle rounded-4xl">
        <CardHeader>
          <CardTitle>Mes plans de charge</CardTitle>
          <CardDescription>Liste de vos plans de charge actifs</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aucun plan de charge pour le moment.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Créez votre premier plan de charge pour commencer.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
