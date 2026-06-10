import { NextRequest, NextResponse } from 'next/server'
import { pingAllDevices } from '@/lib/ping-service'

// ─────────────────────────────────────────────
// POST /api/monitor/ping
// Manual trigger — من الـ dashboard أو testing
// ─────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    console.log('[API] Manual ping check triggered')
    const result = await pingAllDevices()
    console.log('[API] Ping check completed:', result)

    return NextResponse.json(
      {
        success: true,
        message: 'Ping check completed',
        result,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[API] Ping check error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// ─────────────────────────────────────────────
// GET /api/monitor/ping
// للاستخدام من الـ browser أو health checks
// ─────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    console.log('[API] GET ping check triggered')
    const result = await pingAllDevices()

    return NextResponse.json(
      {
        success: true,
        message: 'Ping check completed',
        result,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[API] GET ping error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
