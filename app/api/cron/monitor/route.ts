import { NextRequest, NextResponse } from 'next/server'
import { pingAllDevices } from '@/lib/ping-service'

/**
 * GET /api/cron/monitor
 *
 * يُستدعى تلقائياً من Vercel Cron كل 5 دقائق (vercel.json)
 * محمي بـ CRON_SECRET لمنع الاستدعاء الخارجي غير المصرح
 *
 * أضف هذا في .env:
 *   CRON_SECRET=your-strong-random-secret
 *
 * أضف هذا في vercel.json:
 *   {
 *     "crons": [{ "path": "/api/cron/monitor", "schedule": "* /5 * * * *" }]
 *   }
 */

export async function GET(request: NextRequest) {
  // ── التحقق من الـ secret ──────────────────────
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[Cron] Unauthorized request to /api/cron/monitor')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── تشغيل الـ ping ────────────────────────────
  const startedAt = new Date().toISOString()
  console.log(`[Cron] Monitor job started at ${startedAt}`)

  try {
    const result = await pingAllDevices()

    console.log('[Cron] Monitor job completed:', result)

    return NextResponse.json(
      {
        success: true,
        startedAt,
        completedAt: new Date().toISOString(),
        result,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Cron] Monitor job failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        startedAt,
      },
      { status: 500 }
    )
  }
}
