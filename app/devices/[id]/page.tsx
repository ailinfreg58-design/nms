'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getDevices, getTowers, getDevicePingHistory } from '@/app/actions/nms'
import Link from 'next/link'

export default function DeviceDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const deviceId = params.id as string
  
  const [device, setDevice] = useState<any>(null)
  const [tower, setTower] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [devices, towers] = await Promise.all([
          getDevices(),
          getTowers(),
        ])
        
        const foundDevice = devices.find((d: any) => d.id === deviceId)
        if (!foundDevice) {
          router.push('/devices')
          return
        }

        setDevice(foundDevice)
        const foundTower = towers.find((t: any) => t.id === foundDevice.towerId)
        setTower(foundTower)

        // Load ping history
        if (deviceId) {
          const pingHistory = await getDevicePingHistory(deviceId)
          setHistory(pingHistory)
        }
      } catch (error) {
        console.error('Failed to load device:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [deviceId, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!device) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Device not found</p>
          <Link href="/devices">
            <Button className="mt-4">Back to Devices</Button>
          </Link>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'online': return 'text-green-600'
      case 'offline': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusBgColor = (status: string) => {
    switch(status) {
      case 'online': return 'bg-green-50'
      case 'offline': return 'bg-red-50'
      default: return 'bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <Link href="/devices">
          <Button variant="outline" className="mb-6">
            ← Back to Devices
          </Button>
        </Link>

        {/* Device Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{device.name}</h1>
              <p className="text-gray-600 mt-2">{tower?.name || 'Unknown Tower'}</p>
            </div>
            <Badge className={`text-base px-3 py-1 ${device.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {device.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Main Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">IP Address</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-lg font-semibold">{device.ipAddress}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Device Type</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold capitalize">{device.deviceType}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {device.responseTime ? `${device.responseTime.toFixed(2)}ms` : 'N/A'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Device Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="pb-4 border-b md:border-b-0">
                <p className="text-sm text-gray-600 mb-1">MAC Address</p>
                <p className="font-mono text-sm">{device.macAddress || 'Not configured'}</p>
              </div>
              <div className="pb-4 border-b md:border-b-0">
                <p className="text-sm text-gray-600 mb-1">Tower Location</p>
                <p className="text-sm">
                  {tower ? `${tower.region} (${tower.code})` : 'Unknown'}
                </p>
              </div>
              <div className="pb-4 border-b md:border-b-0">
                <p className="text-sm text-gray-600 mb-1">Last Ping</p>
                <p className="text-sm">
                  {device.lastPing ? new Date(device.lastPing).toLocaleString() : 'Never'}
                </p>
              </div>
              <div className="pb-4 border-b md:border-b-0">
                <p className="text-sm text-gray-600 mb-1">Created</p>
                <p className="text-sm">
                  {new Date(device.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ping History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Ping History</CardTitle>
            <CardDescription>Last 10 ping attempts</CardDescription>
          </CardHeader>
          <CardContent>
            {history.length > 0 ? (
              <div className="space-y-2">
                {history.map((log: any, idx: number) => (
                  <div key={idx} className={`p-3 rounded border flex items-center justify-between ${getStatusBgColor(log.status)}`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${log.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className={`font-medium ${getStatusColor(log.status)}`}>
                        {log.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono">
                        {log.responseTime ? `${log.responseTime}ms` : log.errorMessage || '-'}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(log.pingTime).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No ping history available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
