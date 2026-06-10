'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useSession, signOut } from '@/lib/auth-client'
import { useEffect } from 'react'

export default function Navigation() {
  const router = useRouter()
  const session = useSession()

  const handleLogout = async () => {
    await signOut()
    router.push('/sign-in')
  }

  if (!session?.data?.user) return null

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-indigo-600">
              NMS
            </Link>
            <div className="flex gap-6">
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/towers"
                className="text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Towers
              </Link>
              <Link
                href="/devices"
                className="text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Devices
              </Link>
              <Link
                href="/tickets"
                className="text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Tickets
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session.data.user.email}</span>
            <Button onClick={handleLogout} variant="outline" size="sm">
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
