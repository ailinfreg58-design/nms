'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createDevice, getTowers } from '@/app/actions/nms'
import Link from 'next/link'

export default function AddDevicePage() {
  const router = useRouter()
  const [towers, setTowers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    towerId: '',
    name: '',
    ipAddress: '',
    macAddress: '',
    deviceType: 'camera',
  })

  useEffect(() => {
    async function loadTowers() {
      try {
        const data = await getTowers()
        setTowers(data)
      } catch (error) {
        console.error('Failed to load towers:', error)
      }
    }
    loadTowers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!formData.towerId || !formData.name || !formData.ipAddress) {
        throw new Error('Tower, name, and IP address are required')
      }

      // Validate IP address format
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
      if (!ipRegex.test(formData.ipAddress)) {
        throw new Error('Invalid IP address format')
      }

      // Validate MAC address if provided
      if (formData.macAddress) {
        const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
        if (!macRegex.test(formData.macAddress)) {
          throw new Error('Invalid MAC address format (use: 00:1A:2B:3C:4D:5E)')
        }
      }

      await createDevice({
        ...formData,
        towerId: formData.towerId,
        deviceType: formData.deviceType,
      } as any)

      router.push('/devices')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        <Link href="/devices">
          <Button variant="outline" className="mb-6">
            ← Back to Devices
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Add New Device</CardTitle>
            <CardDescription>Register a new device to be monitored</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Tower *</label>
                <select
                  name="towerId"
                  value={formData.towerId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md bg-white"
                  required
                >
                  <option value="">Select a tower</option>
                  {towers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.code})
                    </option>
                  ))}
                </select>
                {towers.length === 0 && (
                  <p className="text-sm text-orange-600 mt-2">
                    No towers found. <Link href="/towers/add" className="underline">Create a tower first</Link>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Device Name *</label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Main Camera"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Device Type *</label>
                  <select
                    name="deviceType"
                    value={formData.deviceType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md bg-white"
                  >
                    <option value="camera">Camera</option>
                    <option value="router">Router</option>
                    <option value="inverter">Inverter</option>
                    <option value="lpu">LPU</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">IP Address *</label>
                <Input
                  name="ipAddress"
                  value={formData.ipAddress}
                  onChange={handleChange}
                  placeholder="192.168.1.1"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Format: xxx.xxx.xxx.xxx</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">MAC Address (Optional)</label>
                <Input
                  name="macAddress"
                  value={formData.macAddress}
                  onChange={handleChange}
                  placeholder="00:1A:2B:3C:4D:5E"
                />
                <p className="text-xs text-gray-500 mt-1">Format: xx:xx:xx:xx:xx:xx</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Device Information</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>Tower: {towers.find(t => t.id === formData.towerId)?.name || 'Not selected'}</p>
                  <p>Type: {formData.deviceType.charAt(0).toUpperCase() + formData.deviceType.slice(1)}</p>
                  <p>IP: {formData.ipAddress || 'Not set'}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={loading || towers.length === 0}
                  className="flex-1"
                >
                  {loading ? 'Adding...' : 'Add Device'}
                </Button>
                <Link href="/devices" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
