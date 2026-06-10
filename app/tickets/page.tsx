'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { getTickets, createTicket, updateTicketStatus } from '@/app/actions/ticket'
import { getDevices } from '@/app/actions/device'
import Link from 'next/link'

export default function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [devices, setDevices] = useState<any[]>([])
  const [filteredTickets, setFilteredTickets] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [priorityFilter, setPriorityFilter] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    deviceId: '',
    title: '',
    description: '',
    priority: 'medium',
  })

  useEffect(() => {
    async function loadData() {
      try {
        const [ticketsData, devicesData] = await Promise.all([
          getTickets(),
          getDevices(),
        ])
        setTickets(ticketsData)
        setDevices(devicesData)
        setFilteredTickets(ticketsData)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    let filtered = tickets
    if (statusFilter) {
      filtered = filtered.filter((t) => t.status === statusFilter)
    }
    if (priorityFilter) {
      filtered = filtered.filter((t) => t.priority === priorityFilter)
    }
    setFilteredTickets(filtered)
  }, [statusFilter, priorityFilter, tickets])

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createTicket({
        deviceId: parseInt(formData.deviceId),
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
      })
      const updated = await getTickets()
      setTickets(updated)
      setFilteredTickets(updated)
      setShowForm(false)
      setFormData({
        deviceId: '',
        title: '',
        description: '',
        priority: 'medium',
      })
    } catch (error) {
      console.error('Failed to create ticket:', error)
    }
  }

  const handleUpdateStatus = async (ticketId: number, newStatus: string) => {
    try {
      await updateTicketStatus(ticketId, newStatus)
      const updated = await getTickets()
      setTickets(updated)
      setFilteredTickets(updated)
    } catch (error) {
      console.error('Failed to update ticket:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'destructive'
      case 'high':
        return 'destructive'
      case 'medium':
        return 'default'
      case 'low':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'secondary'
      case 'in_progress':
        return 'default'
      case 'resolved':
        return 'default'
      case 'closed':
        return 'outline'
      default:
        return 'outline'
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
            <Button variant="outline">← Back</Button>
          </Link>
          <h1 className="text-3xl font-bold">Tickets</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Ticket'}
          </Button>
        </div>

        {/* Create Ticket Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Ticket</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Device</label>
                    <select
                      value={formData.deviceId}
                      onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    >
                      <option value="">Select a device</option>
                      {devices.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Brief description of the issue"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed description..."
                    className="w-full px-3 py-2 border rounded-md"
                    rows={4}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Create Ticket
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {/* Tickets List */}
        <div className="space-y-3">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => (
              <Card key={ticket.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{ticket.title}</h3>
                      {ticket.description && (
                        <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">
                          {devices.find((d) => d.id === ticket.deviceId)?.name || 'Unknown Device'}
                        </Badge>
                        <Badge variant={getPriorityColor(ticket.priority)} className="capitalize">
                          {ticket.priority}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge variant={getStatusColor(ticket.status)} className="capitalize">
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                      <select
                        value={ticket.status}
                        onChange={(e) => handleUpdateStatus(ticket.id, e.target.value)}
                        className="px-2 py-1 border rounded text-sm"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No tickets found. Create your first ticket!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
