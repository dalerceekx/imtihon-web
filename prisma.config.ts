// Ushbu fayl Prisma tomonidan generatsiya qilingan konfiguratsiya fayli
// DATABASE_URL .env fayldan o'qib olinadi
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
