import { redirect } from '@tanstack/react-router'

import { query } from '@/lib/tuyau'
import { queryClient } from '@/lib/query_client'

export const getMeQueryOptions = () => {
  return query.auth.getMe.queryOptions({}, { retry: false, staleTime: Infinity, gcTime: Infinity })
}

export const isAuthenticatedQueryOptions = () =>
  query.auth.isAuthenticated.queryOptions(
    {},
    { retry: false, staleTime: Infinity, gcTime: Infinity },
  )

export async function isAuthenticated() {
  const result = await queryClient.ensureQueryData(isAuthenticatedQueryOptions())
  return result.isAuthenticated
}

export async function redirectToLoginIfNotAuthenticated() {
  const isAuth = await isAuthenticated()
  if (!isAuth) throw redirect({ to: '/auth/login' })
}

export async function redirectToDashboardIfAuthenticated() {
  const isAuth = await isAuthenticated()
  if (isAuth) throw redirect({ to: '/dashboard' })
}
