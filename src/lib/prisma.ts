import { PrismaClient } from "@prisma/client";

// Globalni singleton - dulezite na Vercelu/serverless prostredi, aby se pri kazdem
// "teplem" volani funkce nevytvarelo nove spojeni do databaze (rychle by se vycerpal
// connection limit u Postgresu). Pro produkci pouzij DATABASE_URL s pooled spojenim
// (Neon/Supabase pooler) - viz .env.example.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

globalForPrisma.prisma = prisma;
