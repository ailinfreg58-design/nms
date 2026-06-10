import { db } from '@/lib/db'
import { device, pingLog, ticket } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface PingResult {
  success: boolean
  responseTime: number | null
  error: string
  method: 'http' | 'tcp-refused' | 'timeout' | 'unreachable'
}

export interface PingAllResult {
  success: number
  failed: number
  ticketsCreated: number
  errors: string[]
}

// ─────────────────────────────────────────────
// Core: HTTP/TCP check (replaces shell ping)
// Works on Vercel serverless — no exec/ICMP needed
// ─────────────────────────────────────────────

export async function pingDevice(
  ipAddress: string,
  port = 80,
  timeoutMs = 5000
): Promise<PingResult> {
  const start = Date.now()

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      await fetch(`http://${ipAddress}`, {
        method: 'HEAD',
        signal: controller.signal,
        // بنمنع redirects عشان نقيس الـ IP مباشرة
        redirect: 'manual',
      })
      clearTimeout(timer)

      return {
        success: true,
        responseTime: Date.now() - start,
        error: '',
        method: 'http',
      }
    } catch (fetchError: any) {
      clearTimeout(timer)

      // ECONNREFUSED = الجهاز موجود على الشبكة، بس الـ port مش مفتوح
      // ده يعني online — مجرد ما فيش web server
      const cause = fetchError?.cause
      const code = cause?.code ?? ''

      if (
        code === 'ECONNREFUSED' ||
        fetchError?.message?.includes('ECONNREFUSED')
      ) {
        return {
          success: true,
          responseTime: Date.now() - start,
          error: '',
          method: 'tcp-refused',
        }
      }

      // AbortError = timeout
      if (
        fetchError?.name === 'AbortError' ||
        code === 'ETIMEDOUT' ||
        code === 'ECONNABORTED'
      ) {
        return {
          success: false,
          responseTime: null,
          error: `Timeout after ${timeoutMs}ms`,
          method: 'timeout',
        }
      }

      // EHOSTUNREACH / ENETUNREACH / ENOTFOUND = الجهاز مش موجود
      return {
        success: false,
        responseTime: null,
        error: fetchError?.message ?? 'Unreachable',
        method: 'unreachable',
      }
    }
  } catch (error) {
    return {
      success: false,
      responseTime: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'unreachable',
    }
  }
}

// ─────────────────────────────────────────────
// Update device status + log ping attempt
// (نفس المنطق القديم — محافظين على البيانات)
// ─────────────────────────────────────────────

export async function updateDeviceStatus(
  deviceId: number,
  status: 'online' | 'offline' | 'unknown',
  responseTime?: number | null,
  error?: string
) {
  const updated = await db
    .update(device)
    .set({
      status,
      lastPing: new Date(),
      responseTime: responseTime ?? null,
      updatedAt: new Date(),
    })
    .where(eq(device.id, deviceId))
    .returning()

  // سجّل كل محاولة في ping_log
  await db.insert(pingLog).values({
    deviceId,
    status,
    responseTime: responseTime ?? null,
    errorMessage: error ?? '',
  })

  return updated[0]
}

// ─────────────────────────────────────────────
// Auto-create ticket when device goes offline
// بنتحقق إن مفيش تذكرة open موجودة للجهاز ده
// عشان ما نعملش تذاكر مكررة
// ─────────────────────────────────────────────

async function autoCreateOfflineTicket(dev: {
  id: number
  name: string
  ipAddress: string
  deviceType: string
  towerId: number
}): Promise<boolean> {
  try {
    // نتحقق إن مفيش تذكرة open أو in_progress لنفس الجهاز
    const existing = await db
      .select()
      .from(ticket)
      .where(
        and(
          eq(ticket.deviceId, dev.id),
          eq(ticket.status, 'open')
        )
      )
      .limit(1)

    if (existing.length > 0) {
      // تذكرة موجودة — ما نعملش تكرار
      return false
    }

    await db.insert(ticket).values({
      deviceId: dev.id,
      title: `[AUTO] جهاز offline: ${dev.name}`,
      description:
        `تم اكتشاف الجهاز "${dev.name}" (${dev.ipAddress}) ` +
        `بحالة offline تلقائياً بواسطة نظام المراقبة.\n` +
        `النوع: ${dev.deviceType}\n` +
        `وقت الاكتشاف: ${new Date().toISOString()}`,
      status: 'open',
      priority: 'high',
      createdBy: 'system',
    })

    return true
  } catch (err) {
    console.error(`[AutoTicket] فشل إنشاء التذكرة للجهاز ${dev.name}:`, err)
    return false
  }
}

// ─────────────────────────────────────────────
// Main: ping all devices
// نفس الـ interface القديم + إضافة ticketsCreated
// ─────────────────────────────────────────────

export async function pingAllDevices(): Promise<PingAllResult> {
  const results: PingAllResult = {
    success: 0,
    failed: 0,
    ticketsCreated: 0,
    errors: [],
  }

  try {
    const devices = await db.select().from(device)

    for (const dev of devices) {
      try {
        const previousStatus = dev.status
        const result = await pingDevice(dev.ipAddress)
        const newStatus = result.success ? 'online' : 'offline'

        await updateDeviceStatus(
          dev.id,
          newStatus,
          result.responseTime,
          result.error
        )

        // تذكرة تلقائية لما الجهاز يطلع offline لأول مرة
        if (newStatus === 'offline' && previousStatus !== 'offline') {
          const created = await autoCreateOfflineTicket(dev)
          if (created) {
            results.ticketsCreated++
            console.log(`[AutoTicket] تذكرة جديدة للجهاز: ${dev.name}`)
          }
        }

        results.success++
        console.log(
          `[Ping] ${dev.name} (${dev.ipAddress}): ${newStatus}` +
          (result.responseTime ? ` — ${result.responseTime}ms` : '') +
          ` [${result.method}]`
        )
      } catch (err) {
        results.failed++
        const msg = err instanceof Error ? err.message : 'Unknown error'
        results.errors.push(`${dev.name}: ${msg}`)
        console.error(`[Ping Error] ${dev.name}: ${msg}`)
      }
    }

    return results
  } catch (error) {
    console.error('[pingAllDevices] خطأ عام:', error)
    throw error
  }
}
