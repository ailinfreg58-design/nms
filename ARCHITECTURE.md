# NMS - Network Monitoring System
## نظام مراقبة الشبكات والأبراج

![NMS System](https://img.shields.io/badge/status-ready-brightgreen)
![Node Version](https://img.shields.io/badge/node-18+-green)
![Next.js](https://img.shields.io/badge/next.js-16-black)
![Database](https://img.shields.io/badge/database-PostgreSQL-blue)

---

## 📋 الملخص

نظام متكامل لمراقبة وإدارة أبراج الاتصالات والأجهزة الشبكية. يوفر تحكم كامل بالأجهزة والأبراج، مع نظام تذاكر دعم فني وتنبيهات فورية عند حدوث مشاكل.

### المميزات الأساسية
- ✅ مراقبة فورية لحالة الأجهزة
- ✅ نظام الـ Ping التلقائي كل 5 دقائق
- ✅ إدارة التذاكر والدعم الفني
- ✅ لوحة معلومات شاملة بالإحصائيات
- ✅ نظام التنبيهات الذكية
- ✅ واجهة مستخدم حديثة

---

## 📁 هيكل المشروع

```
nms-project/
├── app/
│   ├── actions/              # Server Actions للخوادم
│   │   ├── device.ts         # إجراءات إدارة الأجهزة
│   │   ├── tower.ts          # إجراءات إدارة الأبراج
│   │   ├── ticket.ts         # إجراءات إدارة التذاكر
│   │   └── auth.ts           # إجراءات المصادقة
│   ├── api/
│   │   ├── auth/[...all]/    # مسارات المصادقة
│   │   └── monitor/          # مسارات المراقبة
│   ├── layout.tsx            # الـ Layout الرئيسي
│   ├── page.tsx              # الصفحة الرئيسية
│   ├── dashboard/
│   │   └── page.tsx          # لوحة المعلومات
│   ├── towers/
│   │   └── page.tsx          # صفحة إدارة الأبراج
│   ├── devices/
│   │   └── page.tsx          # صفحة إدارة الأجهزة
│   ├── tickets/
│   │   └── page.tsx          # صفحة إدارة التذاكر
│   ├── alerts/
│   │   └── page.tsx          # صفحة التنبيهات
│   ├── settings/
│   │   └── page.tsx          # صفحة الإعدادات
│   ├── sign-in/
│   │   └── page.tsx          # صفحة تسجيل الدخول
│   └── sign-up/
│       └── page.tsx          # صفحة إنشاء حساب
│
├── components/
│   ├── ui/                   # مكونات Shadcn/UI
│   ├── navigation.tsx        # شريط التنقل
│   ├── monitoring-initializer.tsx  # محرك المراقبة
│   └── dashboard-stats.tsx   # إحصائيات لوحة المعلومات
│
├── lib/
│   ├── db.ts                 # اتصال قاعدة البيانات
│   ├── auth.ts               # إعدادات المصادقة
│   ├── auth-client.ts        # عميل المصادقة
│   ├── ping-service.ts       # خدمة الـ Ping
│   ├── background-jobs.ts    # الوظائف الخلفية
│   └── db-schema.ts          # تعريف قاعدة البيانات
│
├── public/
│   └── icons/                # الأيقونات والصور
│
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
├── README.md
├── GUIDE_AR.md               # دليل الاستخدام بالعربية
└── .env.example              # متغيرات البيئة
```

---

## 🛠️ التكنولوجيا المستخدمة

### Frontend
| التقنية | الإصدار | الاستخدام |
|----------|---------|-----------|
| React | 19 | مكتبة الواجهات |
| Next.js | 16 | إطار العمل |
| Tailwind CSS | 4.2 | تنسيق الصفحات |
| Shadcn/UI | آخر | مكونات الواجهة |
| TypeScript | 5.7 | لغة البرمجة |

### Backend
| التقنية | الإصدار | الاستخدام |
|----------|---------|-----------|
| Next.js API Routes | 16 | المسارات الخلفية |
| Server Actions | - | منطق الخادم |
| Drizzle ORM | 0.45 | طبقة قاعدة البيانات |
| Better Auth | 1.6 | نظام المصادقة |
| Node Cron | 4.2 | جدولة المهام |

### Database
| التقنية | الاستخدام |
|----------|-----------|
| PostgreSQL | قاعدة البيانات الرئيسية |
| Neon | خدمة قاعدة البيانات |

---

## 📊 قاعدة البيانات

### جداول النظام

#### جدول `user`
```sql
- id: UUID (PRIMARY KEY)
- email: VARCHAR (UNIQUE)
- password_hash: VARCHAR
- name: VARCHAR
- created_at: TIMESTAMP
```

#### جدول `tower`
```sql
- id: INT (PRIMARY KEY)
- user_id: UUID (FOREIGN KEY)
- name: VARCHAR
- code: VARCHAR
- region: VARCHAR
- latitude: FLOAT
- longitude: FLOAT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### جدول `device`
```sql
- id: INT (PRIMARY KEY)
- tower_id: INT (FOREIGN KEY)
- name: VARCHAR
- device_type: VARCHAR (camera|router|inverter|lpu)
- ip_address: VARCHAR (UNIQUE)
- mac_address: VARCHAR
- status: VARCHAR (online|offline)
- response_time: INT (ms)
- last_ping: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### جدول `ping_log`
```sql
- id: INT (PRIMARY KEY)
- device_id: INT (FOREIGN KEY)
- success: BOOLEAN
- response_time: INT (ms)
- error_message: VARCHAR
- created_at: TIMESTAMP
```

#### جدول `ticket`
```sql
- id: INT (PRIMARY KEY)
- device_id: INT (FOREIGN KEY)
- user_id: UUID (FOREIGN KEY)
- title: VARCHAR
- description: TEXT
- priority: VARCHAR (low|medium|high|critical)
- status: VARCHAR (open|in_progress|resolved|closed)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### جدول `alert`
```sql
- id: INT (PRIMARY KEY)
- device_id: INT (FOREIGN KEY)
- user_id: UUID (FOREIGN KEY)
- type: VARCHAR
- message: TEXT
- is_read: BOOLEAN
- created_at: TIMESTAMP
```

---

## 🚀 البدء السريع

### متطلبات النظام
```bash
Node.js >= 18.0.0
pnpm >= 8.0.0 (أو npm/yarn)
```

### خطوات التثبيت

1. **استنساخ المشروع**
```bash
git clone <repository-url>
cd nms-project
```

2. **تثبيت المتطلبات**
```bash
pnpm install
```

3. **إعداد متغيرات البيئة**
```bash
cp .env.example .env.local
```

ثم عدّل `.env.local`:
```env
DATABASE_URL=postgresql://user:password@host:port/database
BETTER_AUTH_SECRET=<32-character-random-string>
BETTER_AUTH_URL=http://localhost:3000
```

4. **تشغيل الخادم**
```bash
pnpm dev
```

سيظهر:
```
✓ Ready in 2.5s
✓ Compiled successfully
> Ready on http://localhost:3000
```

---

## 🔐 المصادقة والأمان

### نظام المصادقة
- **المصادقة**: Better Auth
- **تشفير كلمات المرور**: bcrypt
- **جلسات آمنة**: HTTP-only cookies
- **الحماية من CSRF**: محمية افتراضياً

### معايير الأمان
```typescript
// كل طلب يتحقق من الجلسة
const session = await authClient.getSession()
if (!session?.user) throw new Error("Not authenticated")

// كل استعلام مرتبط بـ userId الحالي
const devices = await db.select()
  .from(deviceTable)
  .where(eq(deviceTable.userId, session.user.id))
```

---

## 📡 API الرئيسية

### Server Actions

#### إجراءات الأبراج
```typescript
// الحصول على جميع الأبراج
const towers = await getTowers()

// إضافة برج جديد
await createTower({ name, code, region, latitude, longitude })

// تحديث برج
await updateTower(id, { name, code })

// حذف برج
await deleteTower(id)

// إحصائيات البرج
const stats = await getTowerStats(towerId)
```

#### إجراءات الأجهزة
```typescript
// الحصول على جميع الأجهزة
const devices = await getDevices()

// إضافة جهاز جديد
await createDevice({ towerId, name, ipAddress, deviceType })

// تحديث جهاز
await updateDevice(id, { status, responseTime })

// حذف جهاز
await deleteDevice(id)

// إحصائيات الأجهزة
const stats = await getDeviceStats()
```

#### إجراءات التذاكر
```typescript
// الحصول على التذاكر
const tickets = await getTickets()

// إنشاء تذكرة جديدة
await createTicket({ deviceId, title, description, priority })

// تحديث حالة التذكرة
await updateTicketStatus(ticketId, "in_progress")

// إحصائيات التذاكر
const stats = await getTicketStats()
```

---

## 🔄 نظام المراقبة التلقائي

### دورة المراقبة
```
Every 5 minutes:
├─ Fetch all devices from database
├─ Send ping request to each IP
├─ Record response time
├─ Update device status (online/offline)
├─ Log result to ping_log
├─ Create alert if device went offline
└─ Create auto-ticket for critical devices
```

### ملف المراقبة
`lib/ping-service.ts`:
```typescript
export async function pingAllDevices() {
  const devices = await getDevices()
  
  for (const device of devices) {
    const result = await pingDevice(device.ipAddress)
    
    // تحديث قاعدة البيانات
    await updateDeviceStatus(device.id, {
      status: result.success ? 'online' : 'offline',
      responseTime: result.time
    })
    
    // تسجيل النتيجة
    await logPing(device.id, result)
  }
}
```

---

## 📈 الإحصائيات والتقارير

### لوحة المعلومات

```
┌─────────────────────────────────────┐
│ Dashboard Statistics                │
├─────────────────────────────────────┤
│ Total Devices:       125             │
│ Online Devices:      115 (92%)       │
│ Offline Devices:     10  (8%)        │
│ Critical Tickets:    3               │
│ Avg Response Time:   245ms           │
└─────────────────────────────────────┘

Tower Health:
├─ Tower A1: 28 devices (100% online)
├─ Tower B2: 32 devices (94% online)
├─ Tower C3: 35 devices (88% online)
└─ Tower D4: 30 devices (90% online)
```

---

## 🐛 معالجة الأخطاء

### Error Boundaries
```typescript
// في المكونات
<ErrorBoundary>
  <DevicesList />
</ErrorBoundary>

// في Server Actions
try {
  await updateDevice(id, data)
} catch (error) {
  console.error('[NMS Error]', error)
  throw new Error('Failed to update device')
}
```

---

## 🚢 النشر

### نشر على Vercel

1. ربط GitHub
```bash
vercel --prod
```

2. إعداد متغيرات البيئة في Vercel
3. النشر التلقائي عند دفع التغييرات

### بناء الإنتاج
```bash
pnpm build
pnpm start
```

---

## 📝 الترخيص

MIT License - انظر LICENSE file للتفاصيل

---

## 👥 المساهمة

نرحب بالمساهمات! يرجى:
1. عمل Fork للمشروع
2. إنشاء فرع للميزة: `git checkout -b feature/amazing-feature`
3. تقديم Pull Request

---

## 📞 الدعم

- 📧 البريد: support@nms-system.com
- 🌐 الموقع: www.nms-system.com
- 💬 GitHub Issues: للأخطاء والميزات المقترحة

---

**تم التطوير بواسطة**: فريق NMS
**آخر تحديث**: 2026-06-10
**الإصدار الحالي**: 1.0.0
