/**
 * Script para preparar la migración de cuentas de transferencia
 * Este script trabaja con el schema ACTUAL y prepara los datos para la nueva estructura
 */

const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {
  console.log("🔄 Preparando migración de cuentas de transferencia...\n")

  try {
    // Paso 1: Crear tabla transfer_accounts
    console.log("📊 Paso 1: Creando tabla transfer_accounts...")
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS transfer_accounts (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "organizationId" TEXT NOT NULL,
        name TEXT NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT transfer_accounts_organizationId_fkey
          FOREIGN KEY ("organizationId") REFERENCES organizations(id) ON DELETE CASCADE
      )
    `)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS transfer_accounts_organizationId_idx ON transfer_accounts("organizationId")`)
    console.log("✓ Tabla transfer_accounts creada\n")

    // Paso 2: Agregar columna transferAccountId a cash_movements
    console.log("📊 Paso 2: Agregando columna transferAccountId...")
    await prisma.$executeRawUnsafe(`ALTER TABLE cash_movements ADD COLUMN IF NOT EXISTS "transferAccountId" TEXT`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS cash_movements_transferAccountId_idx ON cash_movements("transferAccountId")`)
    console.log("✓ Columna transferAccountId agregada\n")

    // Paso 3: Agregar columna transferTotals a daily_closes
    console.log("📊 Paso 3: Agregando columna transferTotals...")
    await prisma.$executeRawUnsafe(`ALTER TABLE daily_closes ADD COLUMN IF NOT EXISTS "transferTotals" JSONB`)
    console.log("✓ Columna transferTotals agregada\n")

    // Paso 4: Obtener organizaciones
    console.log("📊 Paso 4: Creando cuentas de transferencia por organizaciones...")
    const organizations = await prisma.organization.findMany()
    console.log(`Encontradas ${organizations.length} organizaciones`)

    for (const org of organizations) {
      // Verificar si ya existen las cuentas
      const existing = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*) as count FROM transfer_accounts WHERE "organizationId" = $1`,
        org.id
      )

      if (existing[0].count === '0') {
        // Crear Transfer. Leonardo
        await prisma.$executeRawUnsafe(
          `INSERT INTO transfer_accounts (id, "organizationId", name, "isActive", "createdAt", "updatedAt")
           VALUES (gen_random_uuid()::text, $1, 'Transfer. Leonardo', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          org.id
        )

        // Crear Transfer. Andrés
        await prisma.$executeRawUnsafe(
          `INSERT INTO transfer_accounts (id, "organizationId", name, "isActive", "createdAt", "updatedAt")
           VALUES (gen_random_uuid()::text, $1, 'Transfer. Andrés', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          org.id
        )

        console.log(`  ✓ Cuentas creadas para: ${org.name}`)
      } else {
        console.log(`  → Cuentas ya existen para: ${org.name}`)
      }
    }
    console.log()

    // Paso 5: Migrar datos de cash_movements
    console.log("📊 Paso 5: Migrando datos de cash_movements...")
    for (const org of organizations) {
      const accounts = await prisma.$queryRawUnsafe(
        `SELECT id, name FROM transfer_accounts WHERE "organizationId" = $1`,
        org.id
      )

      const leonardoAccount = accounts.find(a => a.name === 'Transfer. Leonardo')
      const andresAccount = accounts.find(a => a.name === 'Transfer. Andrés')

      if (leonardoAccount && andresAccount) {
        // Migrar TRANSFERENCIA_HERMANO → Leonardo
        const result1 = await prisma.$executeRawUnsafe(
          `UPDATE cash_movements
           SET method = 'TRANSFERENCIA'::"PaymentMethod",
               "transferAccountId" = $1
           WHERE "organizationId" = $2
             AND method = 'TRANSFERENCIA_HERMANO'::"PaymentMethod"
             AND "transferAccountId" IS NULL`,
          leonardoAccount.id,
          org.id
        )

        // Migrar TRANSFERENCIA_ANDRES → Andrés
        const result2 = await prisma.$executeRawUnsafe(
          `UPDATE cash_movements
           SET method = 'TRANSFERENCIA'::"PaymentMethod",
               "transferAccountId" = $1
           WHERE "organizationId" = $2
             AND method = 'TRANSFERENCIA_ANDRES'::"PaymentMethod"
             AND "transferAccountId" IS NULL`,
          andresAccount.id,
          org.id
        )

        console.log(`  ✓ ${org.name}: ${result1 + result2} movimientos actualizados`)
      }
    }
    console.log()

    // Paso 6: Migrar datos de daily_closes
    console.log("📊 Paso 6: Migrando datos de daily_closes...")
    for (const org of organizations) {
      const accounts = await prisma.$queryRawUnsafe(
        `SELECT id, name FROM transfer_accounts WHERE "organizationId" = $1`,
        org.id
      )

      const leonardoAccount = accounts.find(a => a.name === 'Transfer. Leonardo')
      const andresAccount = accounts.find(a => a.name === 'Transfer. Andrés')

      if (leonardoAccount && andresAccount) {
        const closes = await prisma.$queryRawUnsafe(
          `SELECT id, "totalTransferHermano", "totalTransferAndres"
           FROM daily_closes
           WHERE "organizationId" = $1 AND "transferTotals" IS NULL`,
          org.id
        )

        for (const close of closes) {
          const totals = {}
          totals[leonardoAccount.id] = parseFloat(close.totalTransferHermano) || 0
          totals[andresAccount.id] = parseFloat(close.totalTransferAndres) || 0

          await prisma.$executeRawUnsafe(
            `UPDATE daily_closes SET "transferTotals" = $1::jsonb WHERE id = $2`,
            JSON.stringify(totals),
            close.id
          )
        }

        console.log(`  ✓ ${org.name}: ${closes.length} cierres actualizados`)
      }
    }
    console.log()

    console.log("✅ Preparación completada exitosamente\n")
    console.log("🎉 Ahora puedes ejecutar: npx prisma db push\n")

  } catch (error) {
    console.error("❌ Error durante la preparación:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
