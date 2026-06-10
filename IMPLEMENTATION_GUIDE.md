# Network Monitoring System (NMS) - Complete Implementation Guide

## System Overview

A production-ready Network Monitoring System built with **Next.js 16**, **PostgreSQL/Neon**, and **Drizzle ORM**. The system monitors 100+ towers with 4 devices each (cameras, routers, inverters, LPU) with real-time ping status, automated alerts, and comprehensive ticket management.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                  │
│  - Dashboard, Towers, Devices, Tickets Pages          │
│  - Real-time status updates every 5 minutes            │
├─────────────────────────────────────────────────────────┤
│                  Backend (Next.js Server)               │
│  - Server Actions (app/actions/nms.ts)                 │
│  - API Routes (/api/monitor/ping)                      │
│  - Authentication (Better Auth)                        │
├─────────────────────────────────────────────────────────┤
│              Monitoring Service (node-cron)            │
│  - Ping all devices every 5 minutes                    │
│  - Update device status in DB                          │
│  - Create tickets for offline devices                  │
├─────────────────────────────────────────────────────────┤
│          Database (PostgreSQL via Neon)                │
│  - 9 tables with proper indexing                       │
│  - Foreign key constraints                             │
│  - Role-based access control                           │
└─────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Environment Setup

```bash
# Add to Vercel Environment Variables:
DATABASE_URL=postgresql://user:pass@host/db
BETTER_AUTH_SECRET=<generate with: openssl rand -base64 32>
```

### 2. Deploy

```bash
# Via Vercel (recommended)
vercel --prod

# Or local development
pnpm install
pnpm dev
```

The database schema is automatically created on first deployment.

## Database Schema (9 Tables)

### Authentication Tables (Better Auth)
- **user**: User accounts with email, name, image
- **session**: Session tokens and expiration
- **account**: Provider authentication records
- **verification**: Email verification codes

### Application Tables
- **user_profile**: Extended user info (role, assigned regions)
  - Roles: admin, technician, viewer
  
- **tower**: Tower infrastructure (max 100+)
  - Fields: name, code, latitude, longitude, region
  
- **device**: Network devices (4 per tower)
  - Types: camera, router, inverter, lpu
  - Status: online, offline, unknown
  - Tracks: IP, MAC, last_ping, response_time
  
- **ping_log**: Historical ping records
  - Retention: 30 days (auto-cleanup)
  - Fields: device_id, status, response_time, error_message, ping_time
  
- **ticket**: Maintenance tickets
  - Status: open, in_progress, resolved, closed
  - Priority: low, medium, high, critical

## Ping Monitoring System

### How It Works

1. **Client-side trigger** (MonitoringInitializer component):
   - Runs every 5 minutes automatically
   - Calls `/api/monitor/ping` endpoint

2. **API Handler** (app/api/monitor/ping/route.ts):
   - Receives POST request
   - Calls `pingAllDevices()` function

3. **Ping Service** (lib/ping-service.ts):
   - Iterates through all devices
   - Executes native ICMP ping (Windows/Linux compatible)
   - Extracts response times
   - Updates device status and response_time
   - Logs all attempts to ping_log table

4. **Automated Actions**:
   - Device goes offline → Auto-create ticket (high priority)
   - Device comes back online → Update status
   - All events logged for audit trail

### Response Time Detection

```typescript
// Windows: ping -n 1 -w 5000 192.168.1.1
// Extracts: time=123ms

// Linux/Mac: ping -c 1 -W 5 192.168.1.1
// Extracts: time=123ms
```

## API Endpoints

### Monitoring
```
POST /api/monitor/ping
Response: { success: true, result: { success: 0, failed: 0, errors: [] } }
```

### Authentication (Better Auth)
```
POST /api/auth/sign-in
POST /api/auth/sign-up
POST /api/auth/sign-out
```

## Server Actions (RBAC Protected)

All in `app/actions/nms.ts`:

```typescript
// Tower Management (Admin only)
await createTower({ name, code, latitude, longitude, region })
await updateTower(towerId, data)
await deleteTower(towerId)
await getTowers()

// Device Management (Admin/Technician)
await createDevice({ towerId, name, ipAddress, deviceType, ... })
await updateDevice(deviceId, data)
await deleteDevice(deviceId)
await getDevices(filterId?)

// Tickets (All roles)
await createTicket({ deviceId, title, description, priority, ... })
await getTickets(status?)
await updateTicket(ticketId, { status })

// Statistics
await getDeviceStats() // { total, online, offline, uptime% }
await getTowerStats() // per-tower breakdown

// User Management (Admin only)
await updateUserRole(userId, role)
await getAllUsers()
```

## Pages & Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | app/page.tsx | Redirect to dashboard/login |
| `/sign-in` | app/sign-in/page.tsx | User authentication |
| `/sign-up` | app/sign-up/page.tsx | Account creation |
| `/dashboard` | app/dashboard/page.tsx | Main dashboard with KPIs |
| `/towers` | app/towers/page.tsx | Tower management |
| `/devices` | app/devices/page.tsx | Device list + add/filter |
| `/tickets` | app/tickets/page.tsx | Ticket management |

## UI Components

Located in `components/ui/`:
- `button.tsx` - Action buttons
- `input.tsx` - Form inputs
- `card.tsx` - Card containers
- `badge.tsx` - Status badges
- `table.tsx` - Data tables
- `dialog.tsx` - Modals (can add)
- `select.tsx` - Dropdowns (can add)

## User Roles & Permissions

### Admin
- Create/edit/delete towers
- Manage all devices
- View all tickets
- Assign users to regions
- Change user roles

### Technician
- View towers and devices
- Create and update tickets
- Cannot delete infrastructure

### Viewer
- Read-only access to dashboard
- View device status
- Cannot make changes

## Monitoring Configuration

### Ping Frequency
- **Client check**: Every 5 minutes (MonitoringInitializer)
- **Timeout**: 5 seconds per device
- **Batch size**: All devices in parallel

### Log Retention
- **Ping logs**: 30 days (auto-cleanup runs daily at 2 AM)
- **Tickets**: Indefinite (archived at 1 year)

### Auto-Ticket Creation
- Triggered when device status changes from online → offline
- Priority: High
- Auto-assigned to admin or on-call technician
- Status: Open

## Performance Optimization

### Indexing Strategy
```sql
-- Fast queries for common operations:
- idx_device_status (for listing offline devices)
- idx_device_ip (for looking up by IP)
- idx_ping_log_time (for recent history)
- idx_ticket_status (for filtering tickets)
- idx_tower_region (for region-based filtering)
```

### Caching
- Device status: Updated every 5 minutes
- Tower stats: Calculated on request
- Dashboard: Re-renders on status change

### Query Optimization
- Always filter by userId (no RLS - manual scoping)
- Use indexes for WHERE clauses
- Batch operations when possible

## Deployment Checklist

- [ ] Set `DATABASE_URL` in Vercel env vars
- [ ] Generate and set `BETTER_AUTH_SECRET`
- [ ] Database tables auto-created on first deploy
- [ ] Create admin account via signup page
- [ ] Add test towers via UI
- [ ] Add test devices with real/test IPs
- [ ] Verify ping monitoring starts automatically
- [ ] Check `/api/monitor/ping` returns success
- [ ] Confirm tickets auto-create when device offline

## Troubleshooting

### Monitoring not working
```bash
# Check logs
tail -f /tmp/dev.log | grep Monitor

# Manually trigger ping
curl -X POST http://localhost:3000/api/monitor/ping
```

### Database connection fails
```bash
# Verify env var
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Better Auth errors
```bash
# Generate new secret
openssl rand -base64 32

# Restart server
pnpm dev
```

### Devices showing offline incorrectly
- Check firewall allows ICMP (ping)
- Verify IP addresses are correct
- Check server can reach IP (test manually: `ping 192.168.1.1`)
- Review error_message in ping_log table

## Extensions

### Future Enhancements
1. Real-time WebSocket updates (Socket.io)
2. Email notifications for critical alerts
3. SMS alerts for offline devices
4. Device performance graphs (Charts.js)
5. API rate limiting (Upstash)
6. Request logging (structured JSON)
7. Audit trail for all actions
8. Export reports (PDF/CSV)

### Adding WebSocket Support
```typescript
// Install: pnpm add socket.io
// Use Socket.io for real-time updates
// Emit ping results to connected clients
```

## File Structure

```
app/
├── api/
│   ├── auth/[...all]/route.ts
│   └── monitor/ping/route.ts
├── sign-in/page.tsx
├── sign-up/page.tsx
├── dashboard/page.tsx
├── towers/page.tsx
├── devices/page.tsx
├── tickets/page.tsx
└── layout.tsx
components/
├── ui/
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   └── table.tsx
├── navigation.tsx
└── monitoring-initializer.tsx
lib/
├── auth.ts
├── auth-client.ts
├── db/
│   ├── index.ts
│   └── schema.ts
├── ping-service.ts
├── monitor.ts
└── utils.ts
app/
└── actions/
    └── nms.ts
```

## Security Best Practices

1. **Authentication**: Better Auth with session cookies
2. **Authorization**: RBAC checked in every server action
3. **Database**: Row-level scoping (all queries filter by userId)
4. **Secrets**: BETTER_AUTH_SECRET kept in env vars only
5. **SQL**: Parameterized queries via Drizzle ORM
6. **Validation**: Input validation in server actions
7. **CORS**: Same-origin requests only

## Support & Documentation

- **Neon Docs**: https://neon.tech/docs
- **Drizzle ORM**: https://orm.drizzle.team
- **Better Auth**: https://www.better-auth.com
- **Next.js 16**: https://nextjs.org/docs
