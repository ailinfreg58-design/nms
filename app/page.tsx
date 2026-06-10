'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'

export default function Page() {
  const router = useRouter()
  const session = useSession()

  useEffect(() => {
    if (session?.data?.user) {
      router.push('/dashboard')
    } else {
      router.push('/sign-in')
    }
  }, [session, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  )
}
