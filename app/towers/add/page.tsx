'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createTower } from '@/app/actions/nms'
import Link from 'next/link'

export default function AddTowerPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    latitude: '',
    longitude: '',
    region: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!formData.name || !formData.code || !formData.latitude || !formData.longitude || !formData.region) {
        throw new Error('All fields are required')
      }

      const latitude = parseFloat(formData.latitude)
      const longitude = parseFloat(formData.longitude)

      if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error('Latitude and Longitude must be valid numbers')
      }

      if (latitude < -90 || latitude > 90) {
        throw new Error('Latitude must be between -90 and 90')
      }

      if (longitude < -180 || longitude > 180) {
        throw new Error('Longitude must be between -180 and 180')
      }

      await createTower({
        name: formData.name,
        code: formData.code,
        latitude,
        longitude,
        region: formData.region,
      })

      router.push('/towers')
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
        <Link href="/towers">
          <Button variant="outline" className="mb-6">
            ← Back to Towers
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Add New Tower</CardTitle>
            <CardDescription>Create a new tower with location and configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Tower Name *</label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Tower A1"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Tower Code *</label>
                  <Input
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="e.g., TWR-001"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Latitude *</label>
                  <Input
                    name="latitude"
                    type="number"
                    step="0.000001"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="24.860735"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Range: -90 to 90</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Longitude *</label>
                  <Input
                    name="longitude"
                    type="number"
                    step="0.000001"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="46.659385"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Range: -180 to 180</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Region *</label>
                <Input
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  placeholder="e.g., North District"
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Location Preview</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>Latitude: {formData.latitude || 'Not set'}</p>
                  <p>Longitude: {formData.longitude || 'Not set'}</p>
                  {formData.latitude && formData.longitude && (
                    <a 
                      href={`https://maps.google.com/?q=${formData.latitude},${formData.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline block mt-2"
                    >
                      View on Google Maps →
                    </a>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Creating...' : 'Create Tower'}
                </Button>
                <Link href="/towers" className="flex-1">
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
