# NMS - Network Monitoring System

A comprehensive, production-ready tower and network device monitoring platform built with Next.js 16, PostgreSQL (Neon), and Drizzle ORM.

## Architecture Overview

### Technology Stack

- **Frontend**: Next.js 16 (App Router) + React 19
- **Backend**: Node.js with Server Actions & API Routes
- **Database**: PostgreSQL (Neon) + Drizzle ORM
- **Authentication**: Better Auth (email + password)
- **Monitoring**: Native Node.js Ping + node-cron scheduler
- **UI Components**: shadcn/ui + Tailwind CSS
- **Real-time**: Socket.io ready (can be added)

### Database Schema

The system includes 9 tables:

1. **user** - Better Auth user table
2. **session** - Better Auth session management
3. **account** - Better Auth account links
4. **verification** - Better Auth email verification
5. **user_profile** - Extended user roles (admin/technician/viewer)
6. **tower** - Tower/cell site information (100+ towers)
7. **device** - Network devices (camera, router, inverter, LPU)
8. **ping_log** - Historical ping results for analytics
9. **ticket** - Issue tracking and task management
10. **alert** - User notifications and alerts
11. **system_log** - Audit trail for admin actions

## File Structure

```
app/
├── api/
│   ├── auth/[...all]/        # Better Auth endpoints
│   ├── towers/               # Tower API endpoints
│   ├── devices/              # Device API endpoints
│   ├── tickets/              # Ticket API endpoints
│   └── ping/                 # Ping monitoring endpoints
├── actions/
│   ├── auth.ts               # Authentication helpers
│   ├── tower.ts              # Tower server actions
│   ├── device.ts             # Device server actions
│   ├── ticket.ts             # Ticket server actions
│   └── user-profile.ts       # User role management
├── dashboard/                # Main dashboard
├── towers/                   # Tower management pages
├── devices/                  # Device management pages
├── tickets/                  # Ticket management pages
├── alerts/                   # Alerts notification page
├── sign-in/                  # Sign-in page
├── sign-up/                  # Sign-up page
└── page.tsx                  # Redirect to dashboard

lib/
├── auth.ts                   # Better Auth configuration
├── auth-client.ts            # Better Auth React client
├── db/
│   ├── index.ts              # Drizzle client + pg Pool
│   └── schema.ts             # Complete database schema
├── ping-service.ts           # Ping utility (cross-platform)
└── background-jobs.ts        # Cron job scheduler

components/
├── auth-form.tsx             # Sign-in/Sign-up form
├── main-nav.tsx              # Navigation component
└── ui/                       # shadcn/ui components
```

## Quick Start

### 1. Environment Setup

The following environment variables are **automatically** provided by Vercel integrations:

- `DATABASE_URL` - Neon PostgreSQL connection string

You need to add one manually in your project settings:

```bash
BETTER_AUTH_SECRET="$(openssl rand -base64 32)"
```

### 2. Installation

```bash
# Already done, but for reference:
pnpm install
pnpm add better-auth pg drizzle-orm node-cron ping socket.io socket.io-client
```

### 3. Initialize Database

The database schema is defined in `lib/db/schema.ts`. When the application starts, it automatically:

1. Connects to PostgreSQL via Neon
2. Creates tables if they don't exist
3. Initializes background monitoring jobs

### 4. Start Development Server

```bash
pnpm dev
```

Visit http://localhost:3000 (you'll be redirected to sign-in)

### 5. Create Initial User

1. Go to http://localhost:3000/sign-up
2. Register with email + password
3. You're in! The system creates your profile automatically

## Core Features

### Dashboard

Real-time overview of:
- Total towers and devices
- Online/offline device counts
- System uptime percentage
- Open tickets and critical alerts
- Problem towers list

**Location**: `app/dashboard/page.tsx`

### Tower Management

- View all towers with status cards
- Grid or list view
- Filter by issues/healthy/all
- Quick stats: total devices, online count, uptime %
- Edit/delete towers
- View devices per tower

**Location**: `app/towers/page.tsx`

### Device Monitoring

- Complete device inventory
- Filter by status (online/offline/all)
- Real-time ping status
- Response time tracking
- Last ping timestamp
- Bulk device management

**Location**: `app/devices/page.tsx`

### Automatic Ping Monitoring

**Interval**: Every 5 minutes (configurable in `lib/background-jobs.ts`)

**Process**:
1. Fetches all devices from database
2. Pings each device's IP address
3. Updates device status (online/offline/unknown)
4. Records response time and timestamp
5. Logs all results in `ping_log` table
6. Triggers alerts if status changes

**Implementation**: `lib/ping-service.ts` + `lib/background-jobs.ts`

### Ticket Management

- Create tickets for device issues
- Track status: open → in_progress → resolved → closed
- Priority levels: low/medium/high/critical
- Automatic tickets on device offline detection
- Assign to technicians
- Resolution timestamp tracking

**Location**: `app/tickets/page.tsx`

### Role-Based Access Control (RBAC)

Three user roles with different permissions:

1. **Admin**
   - Full system access
   - User management
   - System configuration
   - View all towers/devices/tickets

2. **Technician**
   - View tower/device status
   - Create and resolve tickets
   - View assigned tasks
   - Cannot modify user roles

3. **Viewer**
   - Read-only access to dashboard
   - View status only
   - Cannot create/edit tickets

**Implementation**: `middleware.ts` + `app/actions/user-profile.ts`

### Alerts & Notifications

Automatic alerts triggered by:
- Device going offline
- Device coming back online
- High response time detected
- Ticket status changes

**Location**: `app/alerts/page.tsx`

## API Endpoints

### Towers

```bash
# Get all towers
GET /api/towers

# Get tower by ID
GET /api/towers?id=1

# Get tower with devices
GET /api/towers?id=1&devices=true
```

### Devices

```bash
# Get all devices
GET /api/devices

# Get devices by tower
GET /api/devices?tower_id=1

# Get offline devices only
GET /api/devices?offline=true

# Get device by ID
GET /api/devices?id=1
```

### Tickets

```bash
# Get all tickets
GET /api/tickets

# Get by status
GET /api/tickets?status=open

# Get device tickets
GET /api/tickets?device_id=1

# Get statistics
GET /api/tickets?stats=true
```

### Ping

```bash
# Ping single device
GET /api/ping?action=single&ip=192.168.1.1

# Ping all devices (manual trigger)
GET /api/ping?action=all

# Ping multiple devices
POST /api/ping
{
  "action": "ping-multiple",
  "ips": ["192.168.1.1", "192.168.1.2"]
}
```

## Server Actions

All data mutations use server actions (secure + type-safe):

```typescript
// Examples from app/actions/

// Towers
getTowers()
getTowerStats()
createTower(data)
updateTower(id, data)
deleteTower(id)

// Devices
getDevices()
getAllOfflineDevices()
updateDevice(id, data)
bulkUpdateDeviceStatus(updates)
getDeviceStats()

// Tickets
getTickets(status?)
createTicket(data)
updateTicketStatus(id, status)
getTicketStats()

// Alerts
createAlert(data)
getUnreadAlerts(userId)
markAlertAsRead(alertId)
```

## Background Jobs

Scheduled tasks running automatically:

| Job | Schedule | Action |
|-----|----------|--------|
| Ping all devices | Every 5 minutes | Update device status |
| Cleanup old logs | Daily at 2 AM | Delete 30+ day old ping logs |
| Hourly reports | Every hour | Generate uptime statistics |

**Configuration**: `lib/background-jobs.ts`

To modify intervals, edit the cron expressions:

```typescript
'*/5 * * * *'    // Every 5 minutes
'0 2 * * *'      // Daily at 2 AM
'0 * * * *'      // Every hour
```

## Security

### Authentication
- Email + password (Better Auth)
- Session-based with secure cookies
- CSRF protection built-in
- 30-day session expiration

### Authorization
- Role-based access control (RBAC) in middleware
- Row-level scoping via `userId` in every query
- No foreign key constraints (soft scoping)
- Admin-only routes protected

### Data Protection
- PostgreSQL with Neon (encrypted connection)
- Environment variables for secrets
- No sensitive data in logs
- Automatic audit trail in `system_log` table

## Deployment

### Option 1: Deploy to Vercel (Recommended)

```bash
# Connect GitHub repo
# Select project in Vercel Dashboard
# Vercel automatically:
# - Installs dependencies
# - Sets environment variables from integrations
# - Runs build
# - Deploys
```

Environment variables needed:
- `BETTER_AUTH_SECRET` - Add manually in Vercel Settings
- `DATABASE_URL` - Auto-provided by Neon integration

### Option 2: Self-hosted

```bash
# Build
pnpm build

# Start server
NODE_ENV=production pnpm start

# Or use PM2 for production process management
npm install -g pm2
pm2 start "pnpm start" --name nms
```

## Monitoring & Troubleshooting

### Check Background Jobs

```typescript
// In app/dashboard/page.tsx (add debug endpoint)
// View active cron jobs:
import cron from 'node-cron'
console.log(cron.getTasks())
```

### View Ping Logs

```sql
-- In Neon dashboard
SELECT * FROM ping_log 
ORDER BY ping_time DESC 
LIMIT 100;
```

### Check Device Status

```sql
SELECT name, status, last_ping, response_time 
FROM device 
ORDER BY status DESC, last_ping DESC;
```

### View Recent Errors

```bash
# In development
pnpm dev  # Check console output

# In production
# Check Vercel Edge Network logs
```

## Adding New Features

### Add a New Page

1. Create `app/your-feature/page.tsx`
2. Add route to navigation in `components/main-nav.tsx`
3. Create server actions in `app/actions/your-feature.ts`
4. Add API route in `app/api/your-feature/route.ts` if needed

### Add Database Table

1. Add table definition to `lib/db/schema.ts`
2. Create server actions for CRUD operations
3. Database will auto-sync on next run

### Add Scheduled Job

1. Add cron definition in `lib/background-jobs.ts`
2. Implement job function
3. Add logging for monitoring

## Performance Optimization

### Database
- Indexes on frequently queried columns
- Pagination support in list views
- Connection pooling via Neon
- Query-level caching with SWR (client-side)

### Frontend
- Server components for data fetching
- Incremental static regeneration (ISR)
- Image optimization via Next.js Image
- CSS-in-JS (Tailwind) for minimal bundle

### Monitoring
- Background jobs run in parallel where possible
- Ping timeout of 5 seconds per device
- Max 100 devices before job optimization needed

## Scaling Considerations

For 100+ towers (400+ devices):

1. **Increase Ping Timeout**: Adjust in `lib/ping-service.ts`
2. **Add Redis Cache**: For device status cache
3. **Scale Database**: Neon supports unlimited scaling
4. **Add Worker Threads**: For parallel ping operations
5. **Implement WebSocket**: For real-time updates instead of polling

## Support & Debugging

### Common Issues

**Problem**: Devices always show "unknown" status
- Check device IP addresses are correct
- Verify network connectivity from server to devices
- Check `ping_log` table for error messages

**Problem**: Background jobs not running
- Check `lib/background-jobs.ts` is being called
- Verify cron syntax in `node-cron` documentation
- Check server logs for errors

**Problem**: Authentication failing
- Verify `BETTER_AUTH_SECRET` is set
- Check `DATABASE_URL` is correct
- Clear browser cookies and try again

### Getting Help

- Check `console.log("[v0] ...")` debug statements
- Review Neon dashboard for database status
- Check Vercel deployment logs
- Review Better Auth documentation: https://www.better-auth.com

## License & Credits

Built with:
- Next.js 16
- Better Auth
- Drizzle ORM
- PostgreSQL (Neon)
- shadcn/ui
- Tailwind CSS

---

Happy monitoring! 🚀
