/**
 * background-jobs.ts
 *
 * نفس الـ API القديم (initializeBackgroundJobs / stopBackgroundJobs)
 * مع إضافة Serverless detection:
 *   - Dev: node-cron يشتغل عادي
 *   - Vercel: الدوال بتطلع بدون error لكن الـ cron الحقيقي
 *     بيجي من vercel.json → /api/cron/monitor
 */

import { pingAllDevices } from './ping-service'

type ScheduledTask = { stop: () => void }
let cronJobs: ScheduledTask[] = []

function isServerless(): boolean {
  return (
    process.env.VERCEL === '1' ||
    process.env.VERCEL_ENV !== undefined ||
    process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined
  )
}

export async function initializeBackgroundJobs() {
  // لا تشغّل في المتصفح أبداً
  if (typeof window !== 'undefined') {
    console.log('[Background Jobs] Skipping — browser environment')
    return
  }

  if (isServerless()) {
    console.log(
      '[Background Jobs] Skipping node-cron — Vercel Cron handles scheduling via /api/cron/monitor'
    )
    return
  }

  console.log('[Background Jobs] Initializing...')

  try {
    const cron = await import('node-cron')

    // Ping all devices every 5 minutes
    const pingJob = cron.default.schedule('*/5 * * * *', async () => {
      console.log('[Cron] Ping check at', new Date().toISOString())
      try {
        const results = await pingAllDevices()
        console.log('[Cron] Results:', results)
      } catch (error) {
        console.error('[Cron] Error in ping job:', error)
      }
    })

    cronJobs.push(pingJob)
    console.log('[Background Jobs] Initialized successfully')
  } catch {
    console.warn('[Background Jobs] node-cron not available')
  }
}

export function stopBackgroundJobs() {
  cronJobs.forEach((job) => job.stop())
  cronJobs = []
  console.log('[Background Jobs] All jobs stopped')
}
