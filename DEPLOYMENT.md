# دليل النشر والتطوير

## النشر على Vercel

### المتطلبات الأساسية
- حساب Vercel
- مستودع GitHub
- متغيرات البيئة المطلوبة

### خطوات النشر

#### 1. ربط GitHub مع Vercel

```bash
# تأكد من أن المشروع على GitHub
git remote -v

# إذا لم يكن، أضفه
git remote add origin https://github.com/yourusername/nms-project.git
```

#### 2. إعداد Vercel

أ) انتقل إلى https://vercel.com/dashboard
ب) اضغط "Import Project"
ج) اختر مستودع GitHub

#### 3. إعداد متغيرات البيئة

في لوحة تحكم Vercel:
```
Settings > Environment Variables

أضف:
DATABASE_URL = postgresql://...
BETTER_AUTH_SECRET = <32-character-string>
BETTER_AUTH_URL = https://yourdomain.com
```

#### 4. النشر التلقائي

الآن، مع كل push إلى main:
```bash
git push origin main
# Vercel سيبني ونشر تلقائياً
```

---

## التطوير المحلي

### إعداد بيئة التطوير

```bash
# 1. استنساخ المشروع
git clone https://github.com/yourusername/nms-project.git
cd nms-project

# 2. تثبيت المتطلبات
pnpm install

# 3. إنشاء ملف .env.local
cp .env.example .env.local

# 4. ملء البيانات
nano .env.local
```

### ملف .env.local الكامل

```env
# قاعدة البيانات
DATABASE_URL=postgresql://user:password@localhost:5432/nms_db

# المصادقة
BETTER_AUTH_SECRET=your-32-character-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# البيئة
NODE_ENV=development
VERCEL_ENV=development

# الخادم (اختياري)
PORT=3000
```

### تشغيل الخادم

```bash
# وضع التطوير مع Hot Reload
pnpm dev

# الإخراج المتوقع:
# > ready - started server on 0.0.0.0:3000, url: http://localhost:3000
# ✓ compiled client and server successfully

# ثم افتح: http://localhost:3000
```

---

## إنشاء قاعدة البيانات

### باستخدام Neon

1. **إنشاء حساب Neon**: https://console.neon.tech

2. **إنشاء مشروع جديد**:
   - اضغط "New Project"
   - اختر PostgreSQL version
   - سمِّ المشروع "nms-db"

3. **الحصول على DATABASE_URL**:
   ```
   Dashboard > Connection > Connection String
   
   الصيغة:
   postgresql://username:password@host/database
   ```

4. **إضافة المتغير**:
   ```bash
   # في .env.local
   DATABASE_URL=postgresql://...
   ```

### تشغيل Migrations

```bash
# تطبيق جميع migrations
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# أو للتطوير
pnpm drizzle-kit studio
```

---

## بناء الإنتاج

### خطوات البناء

```bash
# 1. بناء التطبيق
pnpm build

# 2. التحقق من عدم وجود أخطاء
# إذا لم يكن هناك أخطاء، التطبيق جاهز للنشر

# 3. اختبار الإنتاج محلياً (اختياري)
pnpm start
```

### الخلل المحتمل والحلول

| الخطأ | السبب | الحل |
|-------|-------|------|
| `DATABASE_URL is not set` | متغير البيئة غير موجود | أضفه في .env.local |
| `BETTER_AUTH_SECRET is too short` | المفتاح أقل من 32 حرف | جدد المفتاح: `openssl rand -base64 32` |
| `Port 3000 already in use` | منفذ مستخدم | استخدم: `PORT=3001 pnpm dev` |

---

## الاختبار

### اختبار المحلي

```bash
# 1. تسجيل حساب جديد
# الرابط: http://localhost:3000/sign-up

# 2. إنشاء برج
# الرابط: http://localhost:3000/towers

# 3. إضافة جهاز
# الرابط: http://localhost:3000/devices

# 4. التحقق من المراقبة
# الرابط: http://localhost:3000/dashboard
```

### اختبار النشر

```bash
# قبل النشر
pnpm build

# إذا رأيت "✓ Compiled successfully"
# التطبيق جاهز للنشر
```

---

## المراقبة والصيانة

### مراقبة الأداء

```bash
# عرض سجلات Vercel
vercel logs <project-name>

# مراقبة الأداء في الوقت الفعلي
vercel env ls
```

### تحديث التطبيق

```bash
# 1. عمل تغييرات
git add .
git commit -m "Fix: description"

# 2. دفع للـ GitHub
git push origin main

# 3. Vercel سينشر تلقائياً
```

### استعادة نسخة سابقة

```bash
# في لوحة Vercel
Deployments > اختر نسخة > Promote to Production
```

---

## الأمان

### أفضل الممارسات

```typescript
// 1. لا تشارك المتغيرات السرية
// ❌ خطأ
const secret = "my-secret-key"

// ✅ صحيح
const secret = process.env.BETTER_AUTH_SECRET

// 2. تحقق من المصادقة دائماً
const session = await authClient.getSession()
if (!session?.user) {
  throw new Error("Unauthorized")
}

// 3. استخدم HTTPS في الإنتاج
BETTER_AUTH_URL=https://yourdomain.com
```

### إدارة السرار

```bash
# Vercel CLI
vercel env pull  # نزل المتغيرات

# بعد التعديل
vercel env ls    # اعرض المتغيرات
```

---

## استكشاف الأخطاء

### الأخطاء الشائعة

#### ❌ خطأ: Database connection refused
```
الحل:
1. تحقق من DATABASE_URL
2. تأكد أن Neon متصل
3. أعد تشغيل الخادم
```

#### ❌ خطأ: BETTER_AUTH_SECRET is not set
```
الحل:
1. أنشئ مفتاح جديد:
   openssl rand -base64 32
2. أضفه في .env.local
3. أعد تشغيل الخادم
```

#### ❌ خطأ: Cannot find module '@/lib/auth-client'
```
الحل:
1. تحقق من المسار
2. أعد تثبيت المتطلبات:
   pnpm install
```

---

## Docker (اختياري)

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install

COPY . .

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: ${DATABASE_URL}
      BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET}
      BETTER_AUTH_URL: http://localhost:3000
```

### التشغيل مع Docker

```bash
docker-compose up --build
```

---

## CI/CD Pipeline

### GitHub Actions

أنشئ `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build
        run: pnpm build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          BETTER_AUTH_SECRET: ${{ secrets.BETTER_AUTH_SECRET }}
      
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

---

## النسخ الاحتياطية

### نسخ احتياطية من قاعدة البيانات

```bash
# تحميل نسخة احتياطية
pg_dump $DATABASE_URL > backup.sql

# استعادة نسخة احتياطية
psql $DATABASE_URL < backup.sql
```

---

## المراجع والموارد

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Better Auth Documentation](https://better-auth.vercel.app)
- [Drizzle ORM Documentation](https://orm.drizzle.team)

---

**تم إعداده**: 2026-06-10
**الإصدار**: 1.0.0
