import { pgTable, text, timestamp, boolean, serial, varchar, real, integer, index } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const userProfile = pgTable('user_profile', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull().unique(),
  role: varchar('role', { length: 20 }).notNull().default('viewer'),
  phone: varchar('phone', { length: 20 }),
  assignedRegions: text('assigned_regions'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const tower = pgTable('tower', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  region: varchar('region', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('idx_tower_code').on(table.code),
  index('idx_tower_region').on(table.region),
])

export const device = pgTable('device', {
  id: serial('id').primaryKey(),
  towerId: integer('tower_id').notNull(),
  deviceType: varchar('device_type', { length: 20 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  ipAddress: varchar('ip_address', { length: 45 }).notNull().unique(),
  macAddress: varchar('mac_address', { length: 17 }),
  status: varchar('status', { length: 20 }).notNull().default('unknown'),
  lastPing: timestamp('last_ping'),
  responseTime: real('response_time'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('idx_device_status').on(table.status),
  index('idx_device_ip').on(table.ipAddress),
  index('idx_device_tower_status').on(table.towerId, table.status),
])

export const pingLog = pgTable('ping_log', {
  id: serial('id').primaryKey(),
  deviceId: integer('device_id').notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  responseTime: real('response_time'),
  errorMessage: text('error_message'),
  pingTime: timestamp('ping_time').notNull().defaultNow(),
}, (table) => [
  index('idx_ping_log_device_time').on(table.deviceId, table.pingTime),
])

export const ticket = pgTable('ticket', {
  id: serial('id').primaryKey(),
  deviceId: integer('device_id').notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 20 }).notNull().default('open'),
  priority: varchar('priority', { length: 20 }).notNull().default('medium'),
  assignedTo: text('assigned_to'),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  resolvedAt: timestamp('resolved_at'),
}, (table) => [
  index('idx_ticket_status').on(table.status),
  index('idx_ticket_priority').on(table.priority),
  index('idx_ticket_device').on(table.deviceId),
])

export const alert = pgTable('alert', {
  id: serial('id').primaryKey(),
  deviceId: integer('device_id').notNull(),
  userId: text('user_id').notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('idx_alert_user_read').on(table.userId, table.isRead),
  index('idx_alert_device').on(table.deviceId),
])

export const systemLog = pgTable('system_log', {
  id: serial('id').primaryKey(),
  userId: text('user_id'),
  action: varchar('action', { length: 100 }).notNull(),
  resource: varchar('resource', { length: 100 }),
  details: text('details'),
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('idx_log_user').on(table.userId),
])
