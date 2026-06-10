'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUnreadAlerts, markAlertAsRead } from '@/app/actions/ticket'
import { getSession } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

interface Alert {
  id: number
  deviceId: number
  userId: string
  type: string
  message: string
  isRead: boolean
  createdAt: Date
}

export default function AlertsPage() {
  const router = useRouter()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const session = await getSession()
      if (!session?.user) {
        router.push('/sign-in')
        return
      }
      setUserId(session.user.id)

      const unreadAlerts = await getUnreadAlerts(session.user.id)
      setAlerts(unreadAlerts)
    } catch (error) {
      console.error('Error loading alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkAsRead(alertId: number) {
    try {
      await markAlertAsRead(alertId)
      loadData()
    } catch (error) {
      console.error('Error marking alert as read:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading alerts...</div>
      </div>
    )
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'device_offline':
        return 'bg-red-50 border-red-200'
      case 'device_online':
        return 'bg-green-50 border-green-200'
      case 'high_response_time':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'device_offline':
        return '🔴'
      case 'device_online':
        return '🟢'
      case 'high_response_time':
        return '⚠️'
      default:
        return 'ℹ️'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Alerts</h1>
            <p className="text-gray-600 mt-1">{alerts.length} unread alerts</p>
          </div>
          <Button onClick={() => router.push('/dashboard')} variant="outline">
            Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {alerts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-2xl">🎉</p>
            <p className="text-gray-600 mt-2">No unread alerts</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`border rounded-lg p-6 transition-all ${getAlertColor(alert.type)}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 flex-1">
                    <div className="text-3xl">{getAlertIcon(alert.type)}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 capitalize">
                        {alert.type.replace('_', ' ')}
                      </p>
                      <p className="text-gray-700 mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkAsRead(alert.id)}
                  >
                    Mark as Read
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
