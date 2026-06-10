'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { getTowers, createTower, searchTowers } from '@/app/actions/tower'
import Link from 'next/link'

export default function TowersPage() {
  const router = useRouter()
  const [towers, setTowers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    latitude: '',
    longitude: '',
    region: '',
  })

  useEffect(() => {
    async function loadTowers() {
      try {
        const data = await getTowers()
        setTowers(data)
      } catch (error) {
        console.error('Failed to load towers:', error)
      } finally {
        setLoading(false)
      }
    }
    loadTowers()
  }, [])

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearch(query)
    
    if (query.trim()) {
      try {
        const results = await searchTowers(query)
        setTowers(results)
      } catch (error) {
        console.error('Search failed:', error)
      }
    } else {
      const data = await getTowers()
      setTowers(data)
    }
  }

  const handleAddTower = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createTower({
        name: formData.name,
        code: formData.code,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        region: formData.region,
      })
      const updated = await getTowers()
      setTowers(updated)
      setShowForm(false)
      setFormData({
        name: '',
        code: '',
        latitude: '',
        longitude: '',
        region: '',
      })
    } catch (error) {
      console.error('Failed to add tower:', error)
    }
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
        <div className="flex justify-between items-center mb-8">
          <Link href="/dashboard">
            <Button variant="outline" className="mb-4">
              ← Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Towers</h1>
          <Link href="/towers/add">
            <Button>+ Add Tower</Button>
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search towers by name or code..."
            value={search}
            onChange={handleSearch}
            className="max-w-md"
          />
        </div>

        {/* Towers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {towers.map((tower) => (
            <Card key={tower.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{tower.name}</CardTitle>
                    <CardDescription>{tower.code}</CardDescription>
                  </div>
                  <Badge variant="outline">{tower.region}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <p className="text-gray-600">Location</p>
                  <p className="font-mono text-xs">
                    {tower.latitude.toFixed(6)}, {tower.longitude.toFixed(6)}
                  </p>
                  <a 
                    href={`https://maps.google.com/?q=${tower.latitude},${tower.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-xs mt-1 inline-block"
                  >
                    View Map →
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {towers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No towers yet. Create your first tower!</p>
            <Link href="/towers/add">
              <Button>Create Tower</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
