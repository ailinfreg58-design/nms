# Network Monitoring System (NMS)

A comprehensive tower and device monitoring platform built with Next.js 16, PostgreSQL, and Drizzle ORM.

## Features

- **Real-time Device Monitoring**: Continuous ping monitoring of devices across towers
- **Tower Management**: Organize and track multiple towers with geographic coordinates
- **Device Management**: Manage cameras, routers, inverters, and LPU devices
- **Ticket System**: Create and track maintenance tickets and issues
- **Role-Based Access Control**: Admin, Technician, and Viewer roles
- **Automated Alerts**: Automatic ticket creation when devices go offline
- **Dashboard**: Real-time overview of system health and statistics
- **Responsive UI**: Mobile-friendly interface with clean design

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js Server Actions, API Routes
- **Database**: PostgreSQL with Neon
- **ORM**: Drizzle ORM
- **Authentication**: Better Auth
- **Monitoring**: Node.js native ping + node-cron scheduler

## Database Schema

### Core Tables

- **user**: User accounts (from Better Auth)
- **session**: User sessions (from Better Auth)
- **account**: Provider accounts (from Better Auth)
- **verification**: Email verification tokens (from Better Auth)
- **user_profile**: Extended user info with roles and regions
- **tower**: Tower infrastructure (100+ towers supported)
- **device**: Network devices (camera, router, inverter, LPU)
- **ping_log**: Historical ping attempts and results
- **ticket**: Maintenance tickets and issues

## Setup Instructions

### 1. Environment Variables

Set these in your Vercel project:

```
DATABASE_URL=your_neon_database_url
BETTER_AUTH_SECRET=your_32_char_secret (generate with: openssl rand -base64 32)
```

### 2. Database Setup

The database schema is automatically created via Neon MCP. All tables are created with proper indexes and foreign keys.

### 3. Authentication

- Default role-based access:
  - **Admin**: Full system access
  - **Technician**: Device and ticket management
  - **Viewer**: Read-only access

### 4. Monitoring

The system automatically pings all devices every 5 minutes:

- Via client-side `MonitoringInitializer` component (fetches `/api/monitor/ping`)
- Triggered by cron jobs on the server
- Updates device status and creates tickets for offline devices

## API Routes

### Monitoring
- `POST /api/monitor/ping` - Execute ping check on all devices

### Authentication
- `POST /api/auth/sign-in` - User sign-in
- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-out` - User logout

## Server Actions

Located in `app/actions/nms.ts`:

- `getTowers()` - Fetch all towers
- `createTower()` - Create new tower
- `getDevices()` - Fetch devices
- `createDevice()` - Add new device
- `getTickets()` - Fetch tickets
- `createTicket()` - Create ticket
- `updateTicket()` - Update ticket status
- `getDeviceStats()` - Get uptime statistics
- `getTowerStats()` - Tower-level statistics

## Pages

- `/` - Home (redirects authenticated users to dashboard)
- `/sign-in` - Login page
- `/dashboard` - Main dashboard with stats
- `/towers` - Tower management
- `/devices` - Device management with add/filter
- `/tickets` - Ticket tracking and management

## Monitoring Service

The ping service in `lib/ping-service.ts`:

- Supports both Windows and Linux systems
- Detects response times accurately
- Logs all ping attempts to database
- Handles errors gracefully
- Scheduled to run every 5 minutes

## Adding Sample Data

To add test data, create towers and devices through the UI:

1. Sign in to dashboard
2. Go to "Towers" → "+ Add Tower"
3. Create test tower (e.g., Tower A1, coordinates: 24.860735, 46.659385)
4. Go to "Devices" → "+ Add Device"
5. Add devices with IPs (system will auto-ping)

## Production Deployment

1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy - database tables created automatically
4. Monitoring begins immediately

## Monitoring Intervals

- Client-side checks: Every 5 minutes (via MonitoringInitializer)
- API Route: Executes ping for all devices
- Log retention: 30 days (auto-cleanup)

## Security

- Row-level data scoping using userId
- Role-based access control (RBAC)
- Email + password authentication with Better Auth
- Secure session management
- SQL injection protection via Drizzle ORM

## Troubleshooting

### Monitoring not starting
- Check database connection: verify `DATABASE_URL` in env vars
- Check auth secret: ensure `BETTER_AUTH_SECRET` is set (32+ chars)
- Review logs at `/tmp/dev.log`

### Devices showing offline
- Verify IP addresses are reachable from server
- Check firewall rules allow ICMP (ping)
- Review ping logs in database for error messages

### Authentication failing
- Generate new secret: `openssl rand -base64 32`
- Check database user tables exist
- Verify `BETTER_AUTH_SECRET` is correct

## License

MIT

## Support

For issues or questions, check the documentation or create an issue in the repository.
