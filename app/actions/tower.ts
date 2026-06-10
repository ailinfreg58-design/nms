'use server'

import { db } from '@/lib/db'
import { tower, device } from '@/lib/db/schema'
import { eq, ilike } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getUserId } from './auth'

export async function getTowers() {
  await getUserId()
  return db.select().from(tower).orderBy(tower.name)
}

export async function getTowerById(id: number) {
  await getUserId()
  const result = await db.select().from(tower).where(eq(tower.id, id)).limit(1)
  return result[0] || null
}

export async function searchTowers(query: string) {
  await getUserId()
  return db.select().from(tower).where(ilike(tower.name, `%${query}%`)).orderBy(tower.name)
}

export async function getTowerWithDevices(towerId: number) {
  await getUserId()
  const towerData = await db.select().from(tower).where(eq(tower.id, towerId)).limit(1)
  if (!towerData.length) return null
  
  const devices = await db.select().from(device).where(eq(device.towerId, towerId))
  return { ...towerData[0], devices }
}

export async function createTower(data: { name: string; code: string; latitude: number; longitude: number; region: string }) {
  await getUserId()
  const result = await db.insert(tower).values(data).returning()
  revalidatePath('/towers')
  return result[0]
}

export async function updateTower(id: number, data: any) {
  await getUserId()
  const result = await db.update(tower).set(data).where(eq(tower.id, id)).returning()
  revalidatePath('/towers')
  return result[0]
}

export async function deleteTower(id: number) {
  await getUserId()
  await db.delete(device).where(eq(device.towerId, id))
  await db.delete(tower).where(eq(tower.id, id))
  revalidatePath('/towers')
}

export async function getTowerStats() {
  await getUserId()
  const towers = await db.select().from(tower)
  
  const stats = await Promise.all(
    towers.map(async (t) => {
      const devices = await db.select().from(device).where(eq(device.towerId, t.id))
      const onlineCount = devices.filter(d => d.status === 'online').length
      return {
        id: t.id,
        name: t.name,
        totalDevices: devices.length,
        onlineDevices: onlineCount,
        offlineDevices: devices.length - onlineCount,
        uptime: devices.length > 0 ? (onlineCount / devices.length) * 100 : 0,
      }
    })
  )
  
  return stats
}
