'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Button } from './ui/button'

export function MainNav() {
  const router = useRouter()
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Towers', path: '/towers', icon: '🏢' },
    { name: 'Devices', path: '/devices', icon: '🖥️' },
    { name: 'Tickets', path: '/tickets', icon: '🎫' },
    { name: 'Alerts', path: '/alerts', icon: '🔔' },
  ]

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="font-bold text-xl text-blue-600">NMS</div>
          <div className="hidden md:flex gap-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.path
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={() => router.push('/api/auth/signout')} variant="outline">
          Sign Out
        </Button>
      </div>
    </nav>
  )
}
