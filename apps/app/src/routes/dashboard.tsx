import type { Data } from '@opale/api/data'

import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'

import { getMeQueryOptions, redirectToLoginIfNotAuthenticated } from '@/hooks/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
  beforeLoad: async () => await redirectToLoginIfNotAuthenticated(),
})

function RouteComponent() {
  const { data: user } = useSuspenseQuery(getMeQueryOptions())

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-2xl mx-auto px-4">
        <UserCard user={user} />
      </div>
    </div>
  )
}

export function UserCard({ user }: { user: Data.Identity.User }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back!</CardTitle>
        <CardDescription>Here's your account information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Full Name</p>
          <p className="text-lg font-medium">{user.fullName}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="text-lg font-medium">{user.email}</p>
        </div>
      </CardContent>
    </Card>
  )
}
