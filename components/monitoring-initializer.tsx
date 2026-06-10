'use client'

import { useEffect } from 'react'

export default function MonitoringInitializer() {
  useEffect(() => {
    // Initialize monitoring in the background every 5 minutes
    const initializeMonitoring = async () => {
      try {
        const response = await fetch('/api/monitor/ping', {
          method: 'POST',
        })
        if (!response.ok) {
          console.error('[Monitor] Ping check failed:', response.statusText)
        }
      } catch (error) {
        console.error('[Monitor] Error initializing monitoring:', error)
      }
    }

    // Run immediately on mount
    initializeMonitoring()

    // Then run every 5 minutes
    const interval = setInterval(initializeMonitoring, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return null
}
