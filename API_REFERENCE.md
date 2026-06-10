# NMS Complete API Reference

## Overview

The NMS (Network Monitoring System) provides both REST API endpoints and Server Actions for data management.

## Authentication

All endpoints require an authenticated session. The user session is automatically maintained via Better Auth cookies.

**Headers needed:**
```
Cookie: better-auth.session_token=<token>
```

---

## Server Actions (Recommended for Client Components)

Import from `@/app/actions/<module>` and use directly in client/server components.

### Auth Actions (`app/actions/auth.ts`)

```typescript
// Get current user ID (throws if not authenticated)
await getUserId(): Promise<string>

// Get full session with user data
await getSession(): Promise<Session | null>
```

### Tower Actions (`app/actions/tower.ts`)

```typescript
// Get all towers
await getTowers(): Promise<Tower[]>

// Get specific tower by ID
await getTowerById(id: number): Promise<Tower | null>

// Search towers by name
await searchTowers(query: string): Promise<Tower[]>

// Get tower with all its devices
await getTowerWithDevices(towerId: number): Promise<TowerWithDevices | null>

// Create new tower
await createTower(data: {
  name: string
  code: string
  latitude: number
  longitude: number
  region: string
}): Promise<Tower>

// Update tower
await updateTower(id: number, data: Partial<Tower>): Promise<Tower>

// Delete tower (also deletes all devices)
await deleteTower(id: number): Promise<void>

// Get statistics for all towers
await getTowerStats(): Promise<TowerStats[]>
// Returns: { id, name, totalDevices, onlineDevices, offlineDevices, uptime }
```

### Device Actions (`app/actions/device.ts`)

```typescript
// Get all devices
await getDevices(): Promise<Device[]>

// Get specific device
await getDeviceById(id: number): Promise<Device | null>

// Get devices by tower
await getDevicesByTower(towerId: number): Promise<Device[]>

// Create device
await createDevice(data: {
  towerId: number
  deviceType: string  // camera, router, inverter, lpu
  name: string
  ipAddress: string
  macAddress?: string
}): Promise<Device>

// Update device
await updateDevice(id: number, data: Partial<Device>): Promise<Device>

// Delete device
await deleteDevice(id: number): Promise<void>

// Get all offline devices
await getAllOfflineDevices(): Promise<Device[]>

// Get ping history for a device (last 10 by default)
await getDevicePingHistory(deviceId: number, limit?: number): Promise<PingLog[]>

// Bulk update device statuses (for ping results)
await bulkUpdateDeviceStatus(updates: Array<{
  deviceId: number
  status: string
  responseTime?: number
}>): Promise<void>

// Get system statistics
await getDeviceStats(): Promise<{
  total: number
  online: number
  offline: number
  unknown: number
  uptime: number  // percentage
}>
```

### Ticket Actions (`app/actions/ticket.ts`)

```typescript
// Get all tickets (optionally filtered by status)
await getTickets(status?: string): Promise<Ticket[]>

// Get specific ticket
await getTicketById(id: number): Promise<Ticket | null>

// Get tickets for a device
await getTicketsByDevice(deviceId: number): Promise<Ticket[]>

// Create ticket
await createTicket(data: {
  deviceId: number
  title: string
  description?: string
  priority?: string  // low, medium, high, critical
}): Promise<Ticket>

// Update ticket status
await updateTicketStatus(id: number, status: string): Promise<Ticket>
// Statuses: open, in_progress, resolved, closed

// Assign ticket to technician
await assignTicket(id: number, userId: string): Promise<Ticket>

// Update ticket priority
await updateTicketPriority(id: number, priority: string): Promise<Ticket>

// Get ticket statistics
await getTicketStats(): Promise<{
  total: number
  open: number
  inProgress: number
  resolved: number
  closed: number
  critical: number
}>

// Create alert notification
await createAlert(data: {
  deviceId: number
  userId: string
  type: string  // device_offline, device_online, high_response_time
  message: string
}): Promise<Alert>

// Get unread alerts for user
await getUnreadAlerts(userId: string): Promise<Alert[]>

// Mark alert as read
await markAlertAsRead(alertId: number): Promise<Alert>
```

### User Profile Actions (`app/actions/user-profile.ts`)

```typescript
// Get current user's profile
await getUserProfile(): Promise<UserProfile | null>

// Create user profile
await createUserProfile(data: {
  userId: string
  role: 'admin' | 'technician' | 'viewer'
  phone?: string
  assignedRegions?: string
}): Promise<UserProfile>

// Update current user's profile
await updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile>

// Get all users
await getAllUsers(): Promise<UserProfile[]>

// Get users by role
await getUsersByRole(role: string): Promise<UserProfile[]>

// Change user role (admin only)
await updateUserRole(userId: string, role: string): Promise<UserProfile>

// Deactivate user (admin only)
await deactivateUser(userId: string): Promise<UserProfile>

// Get only active users
await getActiveUsers(): Promise<UserProfile[]>
```

---

## REST API Endpoints

### GET /api/towers

Get all towers or specific tower.

**Query Parameters:**
- `id` (number) - Get specific tower by ID
- `devices` (boolean) - Include devices list (only with `id`)

**Response:**
```json
[
  {
    "id": 1,
    "name": "Tower Alpha",
    "code": "TOWER-001",
    "latitude": 24.8615,
    "longitude": 67.0099,
    "region": "North District",
    "createdAt": "2024-06-10T10:00:00Z",
    "updatedAt": "2024-06-10T10:00:00Z"
  }
]
```

**Example:**
```bash
curl http://localhost:3000/api/towers
curl "http://localhost:3000/api/towers?id=1&devices=true"
```

---

### GET /api/devices

Get all devices or filter by criteria.

**Query Parameters:**
- `id` (number) - Get specific device
- `tower_id` (number) - Get devices in tower
- `offline` (boolean) - Get only offline devices

**Response:**
```json
[
  {
    "id": 1,
    "towerId": 1,
    "deviceType": "camera",
    "name": "Main Camera",
    "ipAddress": "192.168.1.100",
    "macAddress": "AA:BB:CC:DD:EE:FF",
    "status": "online",
    "lastPing": "2024-06-10T14:30:00Z",
    "responseTime": 12.5,
    "createdAt": "2024-06-10T10:00:00Z",
    "updatedAt": "2024-06-10T14:30:00Z"
  }
]
```

**Example:**
```bash
curl http://localhost:3000/api/devices
curl "http://localhost:3000/api/devices?tower_id=1"
curl "http://localhost:3000/api/devices?offline=true"
```

---

### GET /api/tickets

Get tickets with optional filters.

**Query Parameters:**
- `id` (number) - Get specific ticket
- `device_id` (number) - Get tickets for device
- `status` (string) - Filter by status (open, in_progress, resolved, closed)
- `stats` (boolean) - Get statistics only

**Response:**
```json
[
  {
    "id": 1,
    "deviceId": 1,
    "title": "High response time on camera",
    "description": "Camera responding slowly",
    "status": "open",
    "priority": "high",
    "assignedTo": "user-123",
    "createdBy": "admin-123",
    "createdAt": "2024-06-10T14:00:00Z",
    "updatedAt": "2024-06-10T14:00:00Z",
    "resolvedAt": null
  }
]
```

**Example:**
```bash
curl http://localhost:3000/api/tickets
curl "http://localhost:3000/api/tickets?status=open"
curl "http://localhost:3000/api/tickets?stats=true"
```

---

### GET /api/ping

Manually trigger ping operations.

**Query Parameters:**
- `action` (string) - Required: `single` or `all`
- `ip` (string) - Required for `single` action

**Response:**
```json
{
  "success": 45,
  "failed": 5,
  "results": [
    {
      "deviceId": 1,
      "ipAddress": "192.168.1.100",
      "status": "online",
      "responseTime": 12.5
    }
  ]
}
```

**Example:**
```bash
curl "http://localhost:3000/api/ping?action=all"
curl "http://localhost:3000/api/ping?action=single&ip=192.168.1.100"
```

### POST /api/ping

Ping multiple devices at once.

**Request Body:**
```json
{
  "action": "ping-multiple",
  "ips": ["192.168.1.100", "192.168.1.101", "192.168.1.102"]
}
```

**Response:**
```json
{
  "ips": [
    {
      "ip": "192.168.1.100",
      "success": true,
      "responseTime": 12.5
    },
    {
      "ip": "192.168.1.101",
      "success": false,
      "error": "Ping failed"
    }
  ]
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/ping \
  -H "Content-Type: application/json" \
  -d '{
    "action": "ping-multiple",
    "ips": ["192.168.1.100", "192.168.1.101"]
  }'
```

---

## Data Types

### Device Status
- `online` - Responding to ping
- `offline` - Not responding to ping
- `unknown` - Never pinged or error

### Device Types
- `camera` - CCTV/surveillance camera
- `router` - Network router
- `inverter` - Power inverter
- `lpu` - Line Power Unit or other

### Ticket Status
- `open` - Created, awaiting assignment
- `in_progress` - Assigned and being worked on
- `resolved` - Fixed but not closed
- `closed` - Completed and closed

### Ticket Priority
- `low` - Non-urgent
- `medium` - Standard priority
- `high` - Urgent
- `critical` - System-critical issue

### User Role
- `admin` - Full system access
- `technician` - Can create/resolve tickets
- `viewer` - Read-only access

### Alert Types
- `device_offline` - Device lost connectivity
- `device_online` - Device restored
- `high_response_time` - Slow response detected

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - OK
- `400` - Bad Request
- `401` - Unauthorized
- `500` - Server Error

**Example:**
```json
{
  "error": "Unauthorized"
}
```

---

## Rate Limiting

Currently no rate limiting. In production, implement:
- Max 100 requests per minute per user
- Max 50 ping requests per minute
- Connection pooling for database

---

## Examples

### Example 1: Get all offline devices

```typescript
const offlineDevices = await getAllOfflineDevices()
console.log(`${offlineDevices.length} devices are offline`)
```

### Example 2: Create a ticket and assign it

```typescript
const ticket = await createTicket({
  deviceId: 1,
  title: "Device not responding",
  priority: "high"
})

await assignTicket(ticket.id, "technician-user-id")
```

### Example 3: Get device statistics for dashboard

```typescript
const stats = await getDeviceStats()
console.log(`System uptime: ${stats.uptime.toFixed(1)}%`)
console.log(`Online: ${stats.online}/${stats.total}`)
```

### Example 4: Fetch data from API in client component

```typescript
'use client'

import { useEffect, useState } from 'react'

export function DeviceList() {
  const [devices, setDevices] = useState([])

  useEffect(() => {
    fetch('/api/devices?offline=true')
      .then(res => res.json())
      .then(data => setDevices(data))
  }, [])

  return <div>{devices.length} offline devices</div>
}
```

---

## Integration Examples

### Python Client
```python
import requests

# Get all towers
response = requests.get('http://localhost:3000/api/towers')
towers = response.json()
```

### JavaScript/Node.js
```javascript
const devices = await fetch('/api/devices').then(r => r.json())
console.log(devices)
```

### cURL
```bash
curl -H "Cookie: <session_token>" \
  http://localhost:3000/api/devices?offline=true
```

---

Generated: 2024-06-10
