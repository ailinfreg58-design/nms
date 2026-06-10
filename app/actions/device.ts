'use server'

import { db } from '@/lib/db'
import { device, pingLog } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getUserId } from './auth'

export async function getDevices() {
  await getUserId()
  return db.select().from(device).orderBy(device.name)
}

export async function getDeviceById(id: number) {
  await getUserId()
  const result = await db.select().from(device).where(eq(device.id, id)).limit(1)
  return result[0] || null
}

export async function getDevicesByTower(towerId: number) {
  await getUserId()
  return db.select().from(device).where(eq(device.towerId, towerId)).orderBy(device.name)
}

export async function createDevice(data: any) {
  await getUserId()
  const result = await db.insert(device).values(data).returning()
  revalidatePath('/devices')
  return result[0]
}

export async function updateDevice(id: number, data: any) {
  await getUserId()
  const result = await db.update(device).set({...data, updatedAt: new Date()}).where(eq(device.id, id)).returning()
  revalidatePath('/devices')
  return result[0]
}

export async function deleteDevice(id: number) {
  await getUserId()
  await db.delete(device).where(eq(device.id, id))
  revalidatePath('/devices')
}

export async function getDeviceStatus(ipAddress: string) {
  await getUserId()
  const result = await db.select().from(device).where(eq(device.ipAddress, ipAddress)).limit(1)
  return result[0] || null
}

export async function getAllOfflineDevices() {
  await getUserId()
  return db.select().from(device).where(eq(device.status, 'offline')).orderBy(device.name)
}

export async function getDevicePingHistory(deviceId: number, limit = 10) {
  await getUserId()
  return db.select().from(pingLog).where(eq(pingLog.deviceId, deviceId)).orderBy(pingLog.pingTime).limit(limit)
}

export async function bulkUpdateDeviceStatus(updates: any[]) {
  await getUserId()
  const now = new Date()
  
  for (const update of updates) {
    await db.update(device).set({status: update.status, lastPing: now, responseTime: update.responseTime, updatedAt: now}).where(eq(device.id, update.deviceId))
    await db.insert(pingLog).values({deviceId: update.deviceId, status: update.status, responseTime: update.responseTime})
  }
  
  revalidatePath('/devices')
}

export async function getDeviceStats() {
  await getUserId()
  const devices = await db.select().from(device)
  
  const stats = {
    total: devices.length,
    online: devices.filter(d => d.status === 'online').length,
    offline: devices.filter(d => d.status === 'offline').length,
    unknown: devices.filter(d => d.status === 'unknown').length,
  }
  
  return {
    ...stats,
    uptime: stats.total > 0 ? (stats.online / stats.total) * 100 : 0,
  }
}
