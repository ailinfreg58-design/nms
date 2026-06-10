/**
 * monitor.ts
 *
 * على البيئة المحلية (dev): node-cron يشتغل عادي
 * على Vercel (production): node-cron ما بيشتغلش في serverless
 *   → الـ cron يجي من vercel.json → /api/cron/monitor
 *   → الدالتين startMonitoring/stopMonitoring بتفضل موجودة
 *     للتوافق مع أي كود قديم بيستدعيهم
 */

import { pingAllDevices } from './ping-service'

// ─────────────────────────────────────────────
// Local dev cron (node-cron) — server only
// ─────────────────────────────────────────────

let cronJob: { stop: () => void } | null = null
let isServerless = false

function detectServerless(): boolean {
  return (
    process.env.VERCEL === '1' ||
    process.env.VERCEL_ENV !== undefined ||
    process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined
  )
}

export async function startMonitoring() {
  // لا تشغّل في المتصفح
  if (typeof window !== 'undefined') return

  isServerless = detectServerless()

  if (isServerless) {
    console.log(
      '[Monitor] Serverless env detected — monitoring handled by Vercel Cron (/api/cron/monitor)'
    )
    return
  }

  if (cronJob) {
    console.log('[Monitor] Already running')
    return
  }

  try {
    // Dynamic import — node-cron موجود في dev فقط
    const cron = await import('node-cron')
    cronJob = cron.default.schedule('*/5 * * * *', async () => {
      try {
        console.log('[Monitor] Starting ping check...', new Date().toISOString())
        const result = await pingAllDevices()
        console.log('[Monitor] Done:', result)
      } catch (error) {
        console.error('[Monitor] Error:', error)
      }
    })
    console.log('[Monitor] Started — pinging every 5 minutes (local mode)')
  } catch {
    console.warn('[Monitor] node-cron not available — skipping local cron')
  }
}

export function stopMonitoring() {
  if (cronJob) {
    cronJob.stop()
    cronJob = null
    console.log('[Monitor] Stopped')
  }
}
