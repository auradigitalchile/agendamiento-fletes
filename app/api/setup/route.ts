import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/setup - Crear tablas necesarias para el módulo de Caja
export async function GET() {
  try {
    // Ejecutar SQL directo para crear las tablas si no existen
    await prisma.$executeRawUnsafe(`
      -- Crear enum UserRole si no existe
      DO $$ BEGIN
        CREATE TYPE "UserRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      -- Crear enum CashMovementType si no existe
      DO $$ BEGIN
        CREATE TYPE "CashMovementType" AS ENUM ('INGRESO', 'GASTO');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      -- Crear enum PaymentMethod si no existe
      DO $$ BEGIN
        CREATE TYPE "PaymentMethod" AS ENUM ('EFECTIVO', 'TRANSFERENCIA');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await prisma.$executeRawUnsafe(`
      -- Crear tabla organizations si no existe
      CREATE TABLE IF NOT EXISTS "organizations" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "organizations_slug_key" ON "organizations"("slug");
      CREATE INDEX IF NOT EXISTS "organizations_slug_idx" ON "organizations"("slug");
    `)

    await prisma.$executeRawUnsafe(`
      -- Agregar campo password a users si no existe
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password" TEXT;
    `)

    await prisma.$executeRawUnsafe(`
      -- Crear tabla user_organizations si no existe
      CREATE TABLE IF NOT EXISTS "user_organizations" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "organizationId" TEXT NOT NULL,
        "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "user_organizations_pkey" PRIMARY KEY ("id")
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "user_organizations_userId_organizationId_key" ON "user_organizations"("userId", "organizationId");
      CREATE INDEX IF NOT EXISTS "user_organizations_userId_idx" ON "user_organizations"("userId");
      CREATE INDEX IF NOT EXISTS "user_organizations_organizationId_idx" ON "user_organizations"("organizationId");
    `)

    await prisma.$executeRawUnsafe(`
      -- Crear tabla accounts si no existe
      CREATE TABLE IF NOT EXISTS "accounts" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "providerAccountId" TEXT NOT NULL,
        "refresh_token" TEXT,
        "access_token" TEXT,
        "expires_at" INTEGER,
        "token_type" TEXT,
        "scope" TEXT,
        "id_token" TEXT,
        "session_state" TEXT,
        CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");
    `)

    await prisma.$executeRawUnsafe(`
      -- Crear tabla sessions si no existe
      CREATE TABLE IF NOT EXISTS "sessions" (
        "id" TEXT NOT NULL,
        "sessionToken" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "expires" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "sessions_sessionToken_key" ON "sessions"("sessionToken");
    `)

    await prisma.$executeRawUnsafe(`
      -- Crear tabla verification_tokens si no existe
      CREATE TABLE IF NOT EXISTS "verification_tokens" (
        "identifier" TEXT NOT NULL,
        "token" TEXT NOT NULL,
        "expires" TIMESTAMP(3) NOT NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "verification_tokens_token_key" ON "verification_tokens"("token");
      CREATE UNIQUE INDEX IF NOT EXISTS "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");
    `)

    await prisma.$executeRawUnsafe(`
      -- Agregar organizationId a clients si no existe
      ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "organizationId" TEXT;
    `)

    await prisma.$executeRawUnsafe(`
      -- Agregar organizationId a services si no existe
      ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "organizationId" TEXT;
    `)

    await prisma.$executeRawUnsafe(`
      -- Crear tabla transfer_accounts si no existe
      CREATE TABLE IF NOT EXISTS "transfer_accounts" (
        "id" TEXT NOT NULL,
        "organizationId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "transfer_accounts_pkey" PRIMARY KEY ("id")
      );

      CREATE INDEX IF NOT EXISTS "transfer_accounts_organizationId_idx" ON "transfer_accounts"("organizationId");
    `)

    await prisma.$executeRawUnsafe(`
      -- Crear tabla cash_movements si no existe
      CREATE TABLE IF NOT EXISTS "cash_movements" (
        "id" TEXT NOT NULL,
        "organizationId" TEXT NOT NULL,
        "type" "CashMovementType" NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "method" "PaymentMethod" NOT NULL,
        "transferAccountId" TEXT,
        "category" TEXT,
        "description" TEXT,
        "relatedService" TEXT,
        "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "cash_movements_pkey" PRIMARY KEY ("id")
      );

      CREATE INDEX IF NOT EXISTS "cash_movements_organizationId_idx" ON "cash_movements"("organizationId");
      CREATE INDEX IF NOT EXISTS "cash_movements_date_idx" ON "cash_movements"("date");
      CREATE INDEX IF NOT EXISTS "cash_movements_type_idx" ON "cash_movements"("type");
      CREATE INDEX IF NOT EXISTS "cash_movements_method_idx" ON "cash_movements"("method");
      CREATE INDEX IF NOT EXISTS "cash_movements_transferAccountId_idx" ON "cash_movements"("transferAccountId");
    `)

    await prisma.$executeRawUnsafe(`
      -- Crear tabla daily_closes si no existe
      CREATE TABLE IF NOT EXISTS "daily_closes" (
        "id" TEXT NOT NULL,
        "organizationId" TEXT NOT NULL,
        "date" TIMESTAMP(3) NOT NULL,
        "totalCash" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "transferTotals" JSONB,
        "totalExpenses" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "finalCash" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "notes" TEXT,
        "closedBy" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "daily_closes_pkey" PRIMARY KEY ("id")
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "daily_closes_date_key" ON "daily_closes"("date");
      CREATE INDEX IF NOT EXISTS "daily_closes_organizationId_idx" ON "daily_closes"("organizationId");
      CREATE INDEX IF NOT EXISTS "daily_closes_date_idx" ON "daily_closes"("date");
    `)

    // Crear organización temporal si no existe
    const orgExists = await prisma.$queryRaw`
      SELECT EXISTS(SELECT 1 FROM organizations WHERE id = 'temp-org-id')
    `

    if (!(orgExists as any)[0].exists) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO "organizations" ("id", "name", "slug", "createdAt", "updatedAt")
        VALUES ('temp-org-id', 'Organización Temporal', 'temp-org', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
      `)
    }

    // Actualizar servicios y clientes existentes con organizationId temporal
    await prisma.$executeRawUnsafe(`
      UPDATE "services"
      SET "organizationId" = 'temp-org-id'
      WHERE "organizationId" IS NULL;
    `)

    await prisma.$executeRawUnsafe(`
      UPDATE "clients"
      SET "organizationId" = 'temp-org-id'
      WHERE "organizationId" IS NULL;
    `)

    return NextResponse.json({
      success: true,
      message: "Tablas creadas exitosamente",
      instrucciones: {
        paso1: "Las tablas han sido creadas en la base de datos",
        paso2: "Ahora visita /api/seed para crear datos de ejemplo",
        paso3: "Después visita /caja para ver el módulo funcionando",
      },
    })
  } catch (error: any) {
    console.error("Error creating tables:", error)
    return NextResponse.json(
      {
        error: "Error al crear tablas",
        details: error.message,
        stack: error.stack,
      },
      { status: 500 }
    )
  }
}
