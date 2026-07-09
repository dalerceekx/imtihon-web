# Kinolar sayti - Backend (NestJS + TypeScript + Prisma)

`4-oy.md` texnik topshirig'i asosida yozilgan to'liq backend. Loyiha `crm_erp` namunasidagi
arxitektura va kod uslubiga mos qilib qurilgan (Prisma + pg adapter, argon2, JWT, guard/role tizimi).

## 1. Texnologiyalar

- **NestJS 11** + **TypeScript**
- **PostgreSQL** + **Prisma ORM** (`@prisma/adapter-pg` orqali)
- **JWT** (access + refresh token) - Bearer header orqali yuboriladi
- **argon2** - parollarni xeshlash
- **class-validator / class-transformer** - DTO validatsiyasi
- **Multer** - poster va video fayllarni yuklash
- **Swagger** - `/swagger` manzilida avtomatik hujjatlar

## 2. O'rnatish

```bash
npm install

# .env faylini yarating
cp .env.example .env
# .env ichida DATABASE_URL, JWT_SECRET va boshqalarni to'ldiring

# Prisma clientni generatsiya qilish (internet kerak - binaries.prisma.sh dan yuklab oladi)
npx prisma generate

# Bazada jadvallarni yaratish
npx prisma migrate dev --name init

# Ishga tushirish (dev rejimida, watch bilan)
npm run start:dev
```

Ilova ishga tushganda **SeederService** avtomatik ravishda:
- superadmin foydalanuvchisini (`.env` dagi `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD`),
- standart obuna rejalarini (**Free**, **Premium**)

yaratib qo'yadi.

Swagger hujjatlari: `http://localhost:3000/swagger`
Barcha API manzillar prefiksi: `http://localhost:3000/api/v1/...`

## 3. Loyiha tuzilishi va har bir qismning vazifasi

```
prisma/schema.prisma        -> Ma'lumotlar bazasi sxemasi (4-oy.md dagi barcha jadvallar)

src/
 ├─ main.ts                 -> Ilovani ishga tushiruvchi fayl: global prefix, ValidationPipe,
 │                              CORS, Swagger sozlamalari shu yerda
 ├─ app.module.ts            -> Barcha modullarni birlashtiruvchi bosh modul
 │
 ├─ core/
 │   ├─ database/
 │   │   ├─ prisma.service.ts -> PostgreSQL bilan ulanishni ochadi/yopadi (Prisma Client)
 │   │   └─ prisma.module.ts  -> PrismaService'ni @Global qilib butun loyihaga ulaydi
 │   └─ utils/
 │       ├─ jwt.ts            -> access/refresh token yaratish va tekshirish (GenerateToken)
 │       └─ jwt.module.ts     -> GenerateToken'ni @Global qilib ulaydi
 │
 ├─ common/
 │   ├─ config/swagger.ts       -> Swagger (API hujjat) konfiguratsiyasi
 │   ├─ constants/quality.constant.ts -> Video sifat enumini ("Q720") "720p" ko'rinishiga o'girish
 │   ├─ utils/slug.util.ts      -> Sarlavhadan URL-slug yasash (masalan kino nomidan)
 │   ├─ decorators/
 │   │   ├─ roles.decorator.ts       -> @Roles(Role.ADMIN, ...) - endpointga ruxsat etilgan rollarni belgilaydi
 │   │   └─ current-user.decorator.ts-> @CurrentUser() - req.user'dan JWT payload'ni oladi
 │   ├─ guards/
 │   │   ├─ auth.guard.ts        -> Tokenni tekshiradi (Bearer header orqali)
 │   │   ├─ optional-auth.guard.ts -> Token bo'lsa userni aniqlaydi, bo'lmasa xato bermaydi (ochiq sahifalar uchun)
 │   │   └─ role.guard.ts        -> req.user.role ni @Roles() bilan solishtiradi
 │   └─ seeders/
 │       ├─ seeder.service.ts    -> Superadmin va standart obuna rejalarini avtomatik yaratadi
 │       └─ seeder.module.ts
 │
 └─ modules/
     ├─ auth/          -> POST /api/v1/auth/register, /login, /logout
     ├─ profile/        -> GET/PUT /api/v1/profile
     ├─ subscriptions/  -> GET /api/v1/subscription/plans, POST /api/v1/subscription/purchase
     ├─ categories/     -> GET /api/v1/categories (ochiq) + /api/v1/admin/categories (admin CRUD)
     ├─ movies/         -> GET /api/v1/movies, GET /api/v1/movies/:slug (ochiq, lekin login bo'lsa qo'shimcha ma'lumot)
     ├─ favorites/      -> GET/POST/DELETE /api/v1/favorites
     ├─ reviews/        -> POST/DELETE /api/v1/movies/:movie_id/reviews
     └─ admin/          -> /api/v1/admin/movies - kinolarni to'liq boshqarish (CRUD + fayl yuklash)
```

Har bir controller/service faylida **funksiyalar ustida izohlar** (nima uchun kerakligi, qanday
ishlashi) yozilgan - kodni o'qiganda har bir metodning vazifasi tushunarli bo'lishi uchun.

## 4. Muhim arxitektura qarorlari

- **RBAC**: `AuthGuard` (login tekshiradi) + `RoleGuard` (`@Roles()` orqali rolga qarab ruxsat beradi)
  birgalikda ishlatiladi. `USER` uchun alohida guard shart emas - login bo'lgani kifoya.
- **Bearer token orqali autentifikatsiya**: login qilganda `accessToken` va `refreshToken`
  javobda qaytariladi, frontend ularni `Authorization: Bearer <token>` header orqali yuboradi.
- **Premium kontent himoyasi**: `GET /api/movies/:slug` javobida, agar kino "premium" bo'lsa va
  foydalanuvchida faol obuna bo'lmasa, `files` massivi bo'sh qaytadi va `requires_subscription: true`
  belgisi qo'shiladi - shu orqali frontend "Obuna sotib oling" deb ko'rsatishi mumkin.
- **Video sifat enumi**: Prisma enum qiymati raqamdan boshlana olmagani uchun ("240p" emas, "Q240"),
  ichkarida `Q240..Q4K` saqlanadi, lekin API javobida har doim `"240p"`, `"720p"`, `"4K"` kabi
  to'g'ri ko'rinishda chiqadi (`quality.constant.ts` orqali).
- **To'lov simulyatsiyasi**: `POST /api/subscription/purchase` haqiqiy to'lov provayderi (Payme,
  Click, Stripe) o'rniga to'lovni darhol "completed" deb belgilaydi - bu joy keyinchalik haqiqiy
  integratsiya bilan almashtiriladi.

## 5. Eslatma

Ushbu muhitda (sandbox) `npx prisma generate` internet cheklovi tufayli ishlamadi (Prisma binary
serverga ulanib bo'lmadi), shuning uchun Prisma Client generatsiya qilinmagan holda kod yozildi.
Kodning barcha qismi TypeScript qoidalariga (isolatedModules, emitDecoratorMetadata) mos ravishda
qo'lda tekshirilgan. Loyihani birinchi marta klonlab olganingizda albatta:

```bash
npx prisma generate
```

buyrug'ini internet mavjud muhitda ishga tushiring - shundan keyin barcha Prisma turlari
(`User`, `Movie`, `Role` va h.k.) to'g'ri tanib olinadi.
