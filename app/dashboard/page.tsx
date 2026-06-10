'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getDeviceStats, getTowerStats, getDevices } from '@/app/actions/nms'
import { getTickets } from '@/app/actions/nms'
import Link from 'next/link'

export default function Dashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [towerStats, setTowerStats] = useState<any[]>([])
  const [tickets, setTickets] = useState<any[]>([])
  const [devices, setDevices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    loadStats()
    
    // Auto-refresh every 30 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(loadStats, 30000)
      return () => clearInterval(interval)
    }
  }, [router, autoRefresh])

  async function loadStats() {
    try {
      const [towers, ticketsList, devicesList] = await Promise.all([
        getTowerStats(),
        getTickets(),
        getDevices(),
      ])
      
      setTowerStats(towers)
      setTickets(ticketsList)
      setDevices(devicesList)
      
      // Calculate stats
      const total = devicesList.length
      const online = devicesList.filter((d: any) => d.status === 'online').length
      const offline = devicesList.filter((d: any) => d.status === 'offline').length
      const uptime = total > 0 ? (online / total) * 100 : 0
      
      setStats({
        total,
        online,
        offline,
        uptime,
        unknown: total - online - offline,
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const criticalTickets = tickets.filter((t: any) => t.priority === 'critical' && t.status !== 'closed').length
  const offlineDevices = devices.filter((d: any) => d.status === 'offline')
  const recentTickets = tickets.slice(0, 5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Network Monitoring System</h1>
            <p className="text-gray-600 mt-2">Real-time tower and device monitoring dashboard</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant={autoRefresh ? "default" : "outline"}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? '🔄 Live' : 'Refresh'}
            </Button>
            <Button onClick={loadStats} variant="outline">Update Now</Button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats?.total || 0}</div>
              <p className="text-xs text-gray-500 mt-1">devices monitored</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Online</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats?.online || 0}</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${stats?.uptime || 0}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Offline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats?.offline || 0}</div>
              <p className="text-xs text-gray-500 mt-1">require attention</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">System Uptime</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats?.uptime?.toFixed(1)}%</div>
              <p className="text-xs text-gray-500 mt-1">overall health</p>
            </CardContent>
          </Card>
        </div>

        {/* Critical Alerts & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Offline Devices Alert */}
          <Card className={offlineDevices.length > 0 ? 'border-red-300 bg-red-50' : ''}>
            <CardHeader>
              <CardTitle className="text-lg">Offline Devices</CardTitle>
              <CardDescription>Devices that need attention</CardDescription>
            </CardHeader>
            <CardContent>
              {offlineDevices.length > 0 ? (
                <div className="space-y-2">
                  {offlineDevices.slice(0, 5).map((device: any) => (
                    <div key={device.id} className="flex items-center justify-between p-2 bg-white rounded border border-red-200">
                      <span className="text-sm font-medium">{device.name}</span>
                      <Badge variant="destructive">Offline</Badge>
                    </div>
                  ))}
                  {offlineDevices.length > 5 && (
                    <p className="text-xs text-gray-600 text-center pt-2">
                      +{offlineDevices.length - 5} more devices
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-green-600">✓ All devices are online</p>
              )}
            </CardContent>
          </Card>

          {/* Critical Tickets */}
          <Card className={criticalTickets > 0 ? 'border-orange-300 bg-orange-50' : ''}>
            <CardHeader>
              <CardTitle className="text-lg">Critical Issues</CardTitle>
              <CardDescription>High priority tickets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2 text-orange-600">{criticalTickets}</div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/tickets')}
                className="w-full"
              >
                View Tickets
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Coverage</CardTitle>
              <CardDescription>Tower deployment status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Towers:</span>
                  <span className="font-bold">{towerStats.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg Devices/Tower:</span>
                  <span className="font-bold">{towerStats.length > 0 ? (stats?.total / towerStats.length).toFixed(1) : 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Healthy Towers:</span>
                  <span className="font-bold text-green-600">{towerStats.filter((t: any) => t.uptime >= 95).length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tower Status Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Tower Status Overview</CardTitle>
            <CardDescription>Real-time status of all monitored towers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {towerStats && towerStats.length > 0 ? (
                towerStats.map((tower: any) => (
                  <div
                    key={tower.id}
                    className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{tower.name}</h3>
                        <p className="text-xs text-gray-600">{tower.region} • {tower.code}</p>
                      </div>
                      <Badge
                        variant={tower.uptime >= 95 ? 'default' : tower.uptime >= 75 ? 'secondary' : 'destructive'}
                      >
                        {tower.uptime >= 95 ? 'Excellent' : tower.uptime >= 75 ? 'Good' : 'Alert'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{tower.onlineDevices}/{tower.totalDevices} Online</p>
                        <p className="text-xs text-gray-600">Uptime: {tower.uptime?.toFixed(1)}%</p>
                      </div>
                      <div className="text-right">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white border-2 border-gray-200">
                          <span className="text-lg font-bold text-blue-600">{tower.uptime?.toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 col-span-2 text-center py-4">No towers found. Start by adding towers.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tickets */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Tickets</CardTitle>
              <CardDescription>Latest maintenance tasks</CardDescription>
            </CardHeader>
            <CardContent>
              {recentTickets.length > 0 ? (
                <div className="space-y-3">
                  {recentTickets.map((ticket: any) => (
                    <div key={ticket.id} className="p-3 bg-gray-50 rounded border">
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 line-clamp-1">{ticket.title}</span>
                        <Badge variant={ticket.priority === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                          {ticket.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No tickets yet</p>
              )}
              <Link href="/tickets">
                <Button variant="outline" className="w-full mt-4">View All</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and navigation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/towers">
                  <Button variant="outline" className="w-full justify-start">
                    <span>🏗️</span>
                    <span className="ml-2">Manage Towers</span>
                  </Button>
                </Link>
                <Link href="/devices">
                  <Button variant="outline" className="w-full justify-start">
                    <span>📱</span>
                    <span className="ml-2">View Devices</span>
                  </Button>
                </Link>
                <Link href="/tickets">
                  <Button variant="outline" className="w-full justify-start">
                    <span>🎫</span>
                    <span className="ml-2">Tickets</span>
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/settings')}
                >
                  <span>⚙️</span>
                  <span className="ml-2">Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
