import type { Data } from '@opale/api/data'

import { Calendar } from 'lucide-react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'

import { getMeQueryOptions, redirectToLoginIfNotAuthenticated } from '@/hooks/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/(app)/dashboard')({
  component: RouteComponent,
  beforeLoad: async () => await redirectToLoginIfNotAuthenticated(),
})

function RouteComponent() {
  const { data: user } = useSuspenseQuery(getMeQueryOptions())

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-2xl mx-auto px-4 space-y-6">
        <UserCard user={user} />

        <Card className="corner-squircle rounded-4xl">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access your tools and features</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/workload">
              <Button variant="outline" className="w-full corner-squircle rounded-4xl">
                <Calendar className="size-4" />
                Plans de charge
              </Button>
            </Link>
          </CardContent>
        </Card>
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
