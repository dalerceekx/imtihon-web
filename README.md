# Kinolar sayti - Backend

Ushbu loyiha NestJS, TypeScript va Prisma yordamida yaratilgan kinolar sayti backend API'sidir. U autentifikatsiya, rolga asoslangan ruxsatlar, obuna tizimi, kategoriyalar, kinolar, sevimlilar, sharhlar va admin paneli uchun CRUD operatsiyalarini qo'llab-quvvatlaydi.

## Asosiy xususiyatlar

- JWT orqali autentifikatsiya
- RBAC (USER / ADMIN / SUPERADMIN)
- Foydalanuvchi profili va obuna boshqaruvi
- Kino va kategoriya CRUD
- Premium kontent uchun obuna tekshiruvi
- Fayl yuklash (poster va video)
- Swagger hujjatlari
- Seeder orqali boshlang'ich ma'lumotlar yaratish

## Texnologiyalar

- NestJS 11
- TypeScript
- Prisma ORM + PostgreSQL
- JWT + argon2
- class-validator / class-transformer
- Multer
- Swagger

## Tez boshlash

### 1. Bog'liqliklarni o'rnatish

```bash
pnpm install
```

### 2. Environment o'zgaruvchilarini sozlash

Proyekt root katalogida `.env` faylini yarating:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/kinosayt
JWT_SECRET=your_super_secret_key
PORT=3000
SUPERADMIN_EMAIL=admin@example.com
SUPERADMIN_PASSWORD=StrongPassword123!
```

### 3. Prisma clientni generatsiya qilish

```bash
pnpm prisma generate
```

### 4. Ma'lumotlar bazasini yaratish

```bash
pnpm prisma migrate dev --name init
```

### 5. Ilovani ishga tushirish

```bash
pnpm run start:dev
```

## Qo'shimcha ma'lumotlar

Ilova ishga tushganda avtomatik ravishda:
- superadmin foydalanuvchisi yaratiladi,
- Free va Premium obuna rejalari yaratiladi.

### Muhim manzillar

- API: http://localhost:3000/api/v1
- Swagger: http://localhost:3000/swagger
- Upload fayllar: http://localhost:3000/uploads/...

## Loyiha tuzilishi

```text
prisma/              -> Prisma schema va migratsiyalar
src/
  main.ts            -> App boshlash va global sozlamalar
  app.module.ts      -> Modullarni birlashtirish
  common/            -> guard, decorator, seeder, util va konfiguratsiyalar
  core/              -> Prisma va JWT modullari
  modules/           -> auth, profile, subscriptions, movies, categories, favorites, reviews, admin
```

## API dizayni haqida qisqacha

- Auth: register, login, logout
- Profile: foydalanuvchi profili ko'rish va tahrirlash
- Subscriptions: obuna rejalari va sotib olish
- Movies: kinolar ro'yxati va tafsilotlari
- Favorites: sevimlilarga qo'shish/o'chirish
- Reviews: kino sharhlari qo'shish/o'chirish
- Admin: kinolar va fayllarni boshqarish

## Eslatma

Agar Prisma generatsiya jarayonida internet cheklovi sababli muammo bo'lsa, muhitda internet mavjud bo'lganda quyidagi buyruqni yana ishga tushiring:

```bash
pnpm prisma generate
```

Bu orqali Prisma client to'liq yaratiladi va barcha model turlari to'g'ri aniqlanadi.
