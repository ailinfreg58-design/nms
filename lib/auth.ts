import { betterAuth } from 'better-auth'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export const auth = betterAuth({
  database: pool,
  emailAndPassword: { enabled: true },
  baseURL: process.env.BETTER_AUTH_URL || `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL}` || 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    process.env.BETTER_AUTH_URL,
    `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`,
    `https://${process.env.VERCEL_URL}`,
    'http://localhost:3000',
  ].filter(Boolean) as string[],
  advanced: {
    defaultCookieAttributes: process.env.NODE_ENV === 'development' ? { sameSite: 'none', secure: true } : undefined,
  },
})
