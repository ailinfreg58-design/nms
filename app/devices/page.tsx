'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { getDevices, getTowers, createDevice } from '@/app/actions/nms'
import Link from 'next/link'

export default function DevicesPage() {
  const router = useRouter()
  const [devices, setDevices] = useState<any[]>([])
  const [towers, setTowers] = useState<any[]>([])
  const [filteredDevices, setFilteredDevices] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTower, setSelectedTower] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    towerId: '',
    name: '',
    ipAddress: '',
    macAddress: '',
    deviceType: 'camera',
  })

  useEffect(() => {
    async function loadData() {
      try {
        const [devicesData, towersData] = await Promise.all([
          getDevices(),
          getTowers(),
        ])
        setDevices(devicesData)
        setTowers(towersData)
        setFilteredDevices(devicesData)
      } catch (error) {
        console.error('Failed to load data:', error)
        router.push('/sign-in')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [router])

  useEffect(() => {
    let filtered = devices
    if (searchTerm) {
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.ipAddress.includes(searchTerm)
      )
    }
    if (selectedTower) {
      filtered = filtered.filter((d) => d.towerId === selectedTower)
    }
    if (selectedStatus) {
      filtered = filtered.filter((d) => d.status === selectedStatus)
    }
    setFilteredDevices(filtered)
  }, [searchTerm, selectedTower, selectedStatus, devices])

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createDevice({
        ...formData,
        towerId: formData.towerId,
        deviceType: formData.deviceType,
      } as any)
      const updated = await getDevices()
      setDevices(updated)
      setFilteredDevices(updated)
      setShowForm(false)
      setFormData({
        towerId: '',
        name: '',
        ipAddress: '',
        macAddress: '',
        deviceType: 'camera',
      })
    } catch (error) {
      console.error('Failed to add device:', error)
    }
  }

  const stats = {
    total: devices.length,
    online: devices.filter((d) => d.status === 'online').length,
    offline: devices.filter((d) => d.status === 'offline').length,
    unknown: devices.filter((d) => d.status === 'unknown').length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/dashboard">
            <Button variant="outline">← Back</Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Devices</h1>
          <Link href="/devices/add">
            <Button>+ Add Device</Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-600">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-600">Online</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.online}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-600">Offline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.offline}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-600">Unknown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.unknown}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Input
            placeholder="Search by name or IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={selectedTower}
            onChange={(e) => setSelectedTower(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white"
          >
            <option value="">All Towers</option>
            {towers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white"
          >
            <option value="">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        {/* Devices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDevices.map((device) => (
            <Link key={device.id} href={`/devices/${device.id}`}>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{device.name}</CardTitle>
                      <CardDescription>{device.ipAddress}</CardDescription>
                    </div>
                    <Badge
                      variant={
                        device.status === 'online'
                          ? 'default'
                          : device.status === 'offline'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Type</p>
                      <p className="font-medium capitalize">{device.deviceType}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Response</p>
                      <p className="font-medium">{device.responseTime ? `${device.responseTime}ms` : '—'}</p>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-600">Tower</p>
                    <p className="font-medium">
                      {towers.find((t) => t.id === device.towerId)?.name || 'Unknown'}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Last ping: {device.lastPing ? new Date(device.lastPing).toLocaleTimeString() : 'Never'}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredDevices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No devices found</p>
            <Link href="/devices/add">
              <Button>Add Your First Device</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
