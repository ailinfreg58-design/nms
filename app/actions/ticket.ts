'use server'

import { db } from '@/lib/db'
import { ticket, alert } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getUserId } from './auth'

export async function getTickets(status?: string) {
  const userId = await getUserId()
  if (status) return db.select().from(ticket).where(eq(ticket.status, status)).orderBy(ticket.createdAt)
  return db.select().from(ticket).orderBy(ticket.createdAt)
}

export async function getTicketById(id: number) {
  await getUserId()
  const result = await db.select().from(ticket).where(eq(ticket.id, id)).limit(1)
  return result[0] || null
}

export async function getTicketsByDevice(deviceId: number) {
  await getUserId()
  return db.select().from(ticket).where(eq(ticket.deviceId, deviceId)).orderBy(ticket.createdAt)
}

export async function createTicket(data: any) {
  const userId = await getUserId()
  const result = await db.insert(ticket).values({...data, createdBy: userId, status: 'open'}).returning()
  revalidatePath('/tickets')
  return result[0]
}

export async function updateTicketStatus(id: number, status: string) {
  await getUserId()
  const data: any = {status, updatedAt: new Date()}
  if (status === 'resolved') data.resolvedAt = new Date()
  
  const result = await db.update(ticket).set(data).where(eq(ticket.id, id)).returning()
  revalidatePath('/tickets')
  return result[0]
}

export async function assignTicket(id: number, userId: string) {
  await getUserId()
  const result = await db.update(ticket).set({assignedTo: userId, updatedAt: new Date()}).where(eq(ticket.id, id)).returning()
  revalidatePath('/tickets')
  return result[0]
}

export async function updateTicketPriority(id: number, priority: string) {
  await getUserId()
  const result = await db.update(ticket).set({priority, updatedAt: new Date()}).where(eq(ticket.id, id)).returning()
  revalidatePath('/tickets')
  return result[0]
}

export async function getTicketStats() {
  await getUserId()
  const tickets = await db.select().from(ticket)
  
  return {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    closed: tickets.filter(t => t.status === 'closed').length,
    critical: tickets.filter(t => t.priority === 'critical').length,
  }
}

export async function createAlert(data: any) {
  const currentUserId = await getUserId()
  const result = await db.insert(alert).values(data).returning()
  revalidatePath('/alerts')
  return result[0]
}

export async function getUnreadAlerts(userId: string) {
  await getUserId()
  return db.select().from(alert).where(eq(alert.userId, userId)).where(eq(alert.isRead, false)).orderBy(alert.createdAt)
}

export async function markAlertAsRead(alertId: number) {
  await getUserId()
  const result = await db.update(alert).set({isRead: true}).where(eq(alert.id, alertId)).returning()
  revalidatePath('/alerts')
  return result[0]
}
