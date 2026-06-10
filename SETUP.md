# NMS Quick Setup Guide

## What's Already Done

Your Network Monitoring System is fully built and ready to use! Here's what's included:

### Database & Schema
- PostgreSQL connected via Neon
- 11 tables for towers, devices, users, tickets, alerts, logs
- Indexes and relationships optimized
- Better Auth tables for authentication

### Backend
- Server Actions for all CRUD operations
- RESTful API endpoints for external integration
- Ping monitoring service (cross-platform: Windows/Linux/Mac)
- Background job scheduler (cron-based)
- RBAC middleware for route protection

### Frontend
- Dashboard with real-time statistics
- Tower management (view, filter, sort)
- Device management (status, response time, history)
- Ticket tracking (create, update, prioritize)
- Alert notifications system
- Authentication (sign-in, sign-up, logout)

### Security
- Email + password authentication via Better Auth
- Role-based access control (Admin/Technician/Viewer)
- Session management with secure cookies
- Per-user data scoping in all queries

## First Steps

### 1. Set Up Environment Variable

You need ONE environment variable manually set in your project settings:

```bash
BETTER_AUTH_SECRET="your-32-character-random-string"
```

Generate one with:
```bash
openssl rand -base64 32
```

Then add it to your Vercel project:
- Go to project Settings → Environment Variables
- Add `BETTER_AUTH_SECRET` with the generated value

### 2. Test the Application

Run the development server:
```bash
pnpm dev
```

Then:
1. Visit http://localhost:3000
2. You'll be redirected to /sign-in
3. Click "Sign Up" to create an account
4. Use any email + password
5. You're in! You'll have admin access by default

### 3. Add Test Data

Once logged in to the dashboard:

#### Add a Tower
```bash
POST /api/towers
{
  "name": "Tower Alpha",
  "code": "TOWER-001",
  "latitude": 24.8615,
  "longitude": 67.0099,
  "region": "North District"
}
```

#### Add a Device
```bash
POST /api/devices
{
  "towerId": 1,
  "deviceType": "camera",
  "name": "Main Camera",
  "ipAddress": "192.168.1.100",
  "macAddress": "AA:BB:CC:DD:EE:FF"
}
```

Or use the UI forms (will be built in next iteration).

### 4. Monitor Background Jobs

The system automatically:
- Pings all devices every 5 minutes
- Logs results with timestamps
- Updates device status (online/offline)
- Triggers alerts on status changes

View recent pings in the database:
```sql
SELECT * FROM ping_log ORDER BY ping_time DESC LIMIT 20;
```

## File Structure Reference

```
app/
├── api/              → REST endpoints
├── actions/          → Server actions (CRUD)
├── dashboard/        → Main dashboard
├── towers/           → Tower management
├── devices/          → Device management
├── tickets/          → Ticket/task tracking
├── alerts/           → Notifications
├── sign-in/          → Login page
└── sign-up/          → Registration page

lib/
├── auth.ts           → Authentication config
├── db/               → Database setup
├── ping-service.ts   → Device monitoring
└── background-jobs.ts → Scheduler

components/
├── main-nav.tsx      → Navigation
├── auth-form.tsx     → Sign-in/up form
└── ui/               → shadcn components
```

## Database Tables

1. **user** - Users (from Better Auth)
2. **session** - Sessions (from Better Auth)
3. **account** - Linked accounts (from Better Auth)
4. **verification** - Email verification (from Better Auth)
5. **user_profile** - User roles (admin/technician/viewer)
6. **tower** - Cell towers/sites
7. **device** - Network devices per tower
8. **ping_log** - Ping history
9. **ticket** - Issues and tasks
10. **alert** - Notifications
11. **system_log** - Audit trail

## API Reference

### Towers API
```bash
GET /api/towers                  # All towers
GET /api/towers?id=1             # By ID
GET /api/towers?id=1&devices=true # With devices
```

### Devices API
```bash
GET /api/devices                 # All devices
GET /api/devices?tower_id=1      # By tower
GET /api/devices?offline=true    # Offline only
```

### Tickets API
```bash
GET /api/tickets                 # All tickets
GET /api/tickets?status=open     # By status
GET /api/tickets?stats=true      # Statistics
```

### Ping API
```bash
GET /api/ping?action=all         # Ping all devices
GET /api/ping?action=single&ip=192.168.1.1  # Single IP
POST /api/ping                   # Multiple IPs (bulk)
```

## User Roles

| Feature | Admin | Technician | Viewer |
|---------|-------|-----------|--------|
| View Dashboard | ✓ | ✓ | ✓ |
| View Towers | ✓ | ✓ | ✓ |
| View Devices | ✓ | ✓ | ✓ |
| View Tickets | ✓ | ✓ | ✓ |
| Create Tickets | ✓ | ✓ | ✗ |
| Manage Users | ✓ | ✗ | ✗ |
| System Settings | ✓ | ✗ | ✗ |

## Customization Options

### Change Ping Interval
Edit `lib/background-jobs.ts`, line 14:
```typescript
crontab: '*/5 * * * *',  // Change 5 to desired minutes
```

### Change Device Ping Timeout
Edit `lib/ping-service.ts`, line 29:
```typescript
timeout = 5  // Change timeout in seconds
```

### Add New User Role
1. Update `userProfile` table schema in `lib/db/schema.ts`
2. Add role to `RBAC_ROLES` in `middleware.ts`
3. Update permissions in role check logic

## Troubleshooting

### Devices showing "unknown" status
- Check IP addresses are reachable from your server
- Verify network connectivity
- Check ping logs for error details

### Background jobs not running
- Check application is fully started
- Verify `BETTER_AUTH_SECRET` is set
- Check browser console for errors

### Can't sign in
- Clear cookies and try again
- Verify `DATABASE_URL` exists in env vars
- Check `BETTER_AUTH_SECRET` is set

### Slow dashboard loading
- Database might need optimization
- Check Neon connection status
- Consider adding pagination

## Next Steps

1. **Deploy to Vercel**
   - Push to GitHub
   - Connect in Vercel Dashboard
   - Auto-deploys on push

2. **Add More Features**
   - Form builders for tower/device creation
   - Charts and analytics
   - Email notifications
   - Export reports

3. **Scale Infrastructure**
   - Add Redis cache for device status
   - Implement WebSocket for real-time updates
   - Add worker threads for parallel pings
   - Database optimization for 1000+ devices

4. **Monitoring & Logging**
   - Integrate Sentry for error tracking
   - Add PostHog for analytics
   - Implement application metrics

## Support

- Review the comprehensive docs: `NMS_README.md`
- Check Vercel docs: https://vercel.com/docs
- Better Auth docs: https://www.better-auth.com
- Neon docs: https://neon.tech/docs

Happy monitoring!
