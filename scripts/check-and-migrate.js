/**
 * Script para verificar y migrar datos faltantes
 */

const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {
  console.log("🔍 Verificando datos pendientes de migración...\n")

  try {
    // Verificar cash_movements con valores antiguos
    const pendingMovements = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count
      FROM cash_movements
      WHERE method IN ('TRANSFERENCIA_ANDRES'::"PaymentMethod", 'TRANSFERENCIA_HERMANO'::"PaymentMethod")
    `)
    console.log(`Movimientos de caja pendientes: ${pendingMovements[0].count}`)

    if (pendingMovements[0].count !== '0') {
      console.log("\n🔄 Migrando movimientos de caja...")

      const organizations = await prisma.organization.findMany()

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
               AND method = 'TRANSFERENCIA_HERMANO'::"PaymentMethod"`,
            leonardoAccount.id,
            org.id
          )

          // Migrar TRANSFERENCIA_ANDRES → Andrés
          const result2 = await prisma.$executeRawUnsafe(
            `UPDATE cash_movements
             SET method = 'TRANSFERENCIA'::"PaymentMethod",
                 "transferAccountId" = $1
             WHERE "organizationId" = $2
               AND method = 'TRANSFERENCIA_ANDRES'::"PaymentMethod"`,
            andresAccount.id,
            org.id
          )

          console.log(`  ✓ ${org.name}: ${result1 + result2} movimientos actualizados`)
        }
      }
    }

    // Verificar daily_closes con datos en columnas antiguas
    const pendingCloses = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count
      FROM daily_closes
      WHERE ("totalTransferHermano" IS NOT NULL OR "totalTransferAndres" IS NOT NULL)
        AND "transferTotals" IS NULL
    `)
    console.log(`\nCierres diarios pendientes: ${pendingCloses[0].count}`)

    if (pendingCloses[0].count !== '0') {
      console.log("\n🔄 Migrando cierres diarios...")

      const organizations = await prisma.organization.findMany()

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
             WHERE "organizationId" = $1
               AND ("totalTransferHermano" IS NOT NULL OR "totalTransferAndres" IS NOT NULL)
               AND "transferTotals" IS NULL`,
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
    }

    console.log("\n✅ Migración completada\n")

  } catch (error) {
    console.error("❌ Error:", error)
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
