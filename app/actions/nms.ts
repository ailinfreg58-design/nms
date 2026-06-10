'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  tower,
  device,
  ticket,
  pingLog,
  userProfile,
  user as userTable,
} from '@/lib/db/schema'
import { eq, and, desc, asc, inArray } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

async function getUserRole() {
  const userId = await getUserId()
  const profile = await db.query.userProfile.findFirst({
    where: eq(userProfile.userId, userId),
  })
  return profile?.role || 'viewer'
}

// Tower actions
export async function getTowers() {
  await getUserId()
  return db.select().from(tower).orderBy(asc(tower.region))
}

export async function createTower(data: {
  name: string
  code: string
  latitude: number
  longitude: number
  region: string
}) {
  const role = await getUserRole()
  if (role !== 'admin') throw new Error('Unauthorized: Admin only')

  const result = await db
    .insert(tower)
    .values(data)
    .returning()
  revalidatePath('/towers')
  return result[0]
}

export async function updateTower(
  towerId: string,
  data: Partial<(typeof tower.$inferInsert)>
) {
  const role = await getUserRole()
  if (role !== 'admin') throw new Error('Unauthorized: Admin only')

  const result = await db
    .update(tower)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(tower.id, towerId))
    .returning()
  revalidatePath('/towers')
  return result[0]
}

export async function deleteTower(towerId: string) {
  const role = await getUserRole()
  if (role !== 'admin') throw new Error('Unauthorized: Admin only')

  await db.delete(tower).where(eq(tower.id, towerId))
  revalidatePath('/towers')
}

// Device actions
export async function getDevices(filterId?: string) {
  await getUserId()
  if (filterId) {
    return db
      .select()
      .from(device)
      .where(eq(device.towerId, filterId))
      .orderBy(asc(device.name))
  }
  return db.select().from(device).orderBy(asc(device.name))
}

export async function createDevice(data: (typeof device.$inferInsert)) {
  const role = await getUserRole()
  if (!['admin', 'technician'].includes(role))
    throw new Error('Unauthorized')

  const result = await db
    .insert(device)
    .values(data)
    .returning()
  revalidatePath('/devices')
  return result[0]
}

export async function updateDevice(
  deviceId: string,
  data: Partial<(typeof device.$inferInsert)>
) {
  const role = await getUserRole()
  if (!['admin', 'technician'].includes(role))
    throw new Error('Unauthorized')

  const result = await db
    .update(device)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(device.id, deviceId))
    .returning()
  revalidatePath('/devices')
  return result[0]
}

export async function deleteDevice(deviceId: string) {
  const role = await getUserRole()
  if (role !== 'admin') throw new Error('Unauthorized: Admin only')

  await db.delete(device).where(eq(device.id, deviceId))
  revalidatePath('/devices')
}

// Statistics
export async function getDeviceStats() {
  await getUserId()
  const devices = await db.select().from(device)

  const online = devices.filter((d) => d.status === 'online').length
  const offline = devices.filter((d) => d.status === 'offline').length
  const unknown = devices.filter((d) => d.status === 'unknown').length
  const total = devices.length

  return {
    total,
    online,
    offline,
    unknown,
    uptime: total > 0 ? ((online / total) * 100).toFixed(2) : 0,
  }
}

export async function getTowerStats() {
  await getUserId()
  const towers = await db.select().from(tower)
  const devices = await db.select().from(device)

  return towers.map((t) => {
    const towerDevices = devices.filter((d) => d.towerId === t.id)
    const onlineCount = towerDevices.filter((d) => d.status === 'online').length
    return {
      ...t,
      totalDevices: towerDevices.length,
      onlineDevices: onlineCount,
      uptime: towerDevices.length > 0 
        ? ((onlineCount / towerDevices.length) * 100).toFixed(2)
        : 0,
    }
  })
}

// Ticket actions
export async function createTicket(data: (typeof ticket.$inferInsert)) {
  const userId = await getUserId()
  const result = await db
    .insert(ticket)
    .values(data)
    .returning()
  revalidatePath('/tickets')
  return result[0]
}

export async function getTickets(status?: string) {
  await getUserId()
  if (status) {
    return db
      .select()
      .from(ticket)
      .where(eq(ticket.status, status))
      .orderBy(desc(ticket.createdAt))
  }
  return db.select().from(ticket).orderBy(desc(ticket.createdAt))
}

export async function updateTicket(
  ticketId: string,
  data: Partial<(typeof ticket.$inferInsert)>
) {
  const role = await getUserRole()
  if (!['admin', 'technician'].includes(role))
    throw new Error('Unauthorized')

  const result = await db
    .update(ticket)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(ticket.id, ticketId))
    .returning()
  revalidatePath('/tickets')
  return result[0]
}

// Ping logs
export async function getPingLogs(deviceId: string, limit = 50) {
  await getUserId()
  return db
    .select()
    .from(pingLog)
    .where(eq(pingLog.deviceId, deviceId))
    .orderBy(desc(pingLog.pingTime))
    .limit(limit)
}

export async function getDevicePingHistory(deviceId: string, limit = 10) {
  await getUserId()
  return db
    .select()
    .from(pingLog)
    .where(eq(pingLog.deviceId, deviceId))
    .orderBy(desc(pingLog.pingTime))
    .limit(limit)
}

// User management (admin only)
export async function updateUserRole(userId: string, role: 'admin' | 'technician' | 'viewer') {
  const currentRole = await getUserRole()
  if (currentRole !== 'admin') throw new Error('Unauthorized')

  const result = await db
    .update(userProfile)
    .set({ role, updatedAt: new Date() })
    .where(eq(userProfile.userId, userId))
    .returning()
  revalidatePath('/settings/users')
  return result[0]
}

export async function getAllUsers() {
  const role = await getUserRole()
  if (role !== 'admin') throw new Error('Unauthorized')

  const users = await db
    .select({
      id: userTable.id,
      email: userTable.email,
      name: userTable.name,
      profile: userProfile,
    })
    .from(userTable)
    .leftJoin(userProfile, eq(userTable.id, userProfile.userId))

  return users
}
