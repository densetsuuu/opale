import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation } from '@tanstack/react-query'

import { query } from '@/lib/tuyau'
import { queryClient } from '@/lib/query_client'
import { getMeQueryOptions } from '@/hooks/auth'

import { Button } from './ui/button'

export default function Header() {
  const navigate = useNavigate()

  const [isOpen, setIsOpen] = useState(false)
  const { data: user } = useQuery(getMeQueryOptions())

  const logout = useMutation(
    query.auth.logout.mutationOptions({
      onSuccess: async () => {
        queryClient.clear()
        await navigate({ to: '/' })
      },
    }),
  )

  return (
    <header className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-semibold">
            StarterKit
          </Link>

          <div className="hidden md:flex md:items-center md:space-x-3">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Button variant="ghost" onClick={() => logout.mutate({})}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth/login">
                  <Button variant="ghost">Sign in</Button>
                </Link>
                <Link to="/auth/register">
                  <Button>Get started</Button>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen((s) => !s)}
              aria-expanded={isOpen}
              aria-label="Toggle navigation"
              className="p-2 rounded-md inline-flex items-center justify-center hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {isOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden mt-2 pb-4">
            <nav className="flex flex-col space-y-2">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => logout.mutate({})}
                    className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent text-left"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/auth/register"
                    className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white text-center"
                  >
                    Get started
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
