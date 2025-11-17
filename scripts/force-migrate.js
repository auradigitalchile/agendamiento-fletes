/**
 * Script para forzar la migración de todos los datos
 */

const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {
  console.log("🔧 Forzando migración de todos los datos...\n")

  try {
    // Primero verificar si existen cuentas
    const accounts = await prisma.$queryRawUnsafe(`
      SELECT ta.id, ta.name, o.name as org_name
      FROM transfer_accounts ta
      JOIN organizations o ON ta."organizationId" = o.id
      ORDER BY o.name, ta.name
    `)

    console.log(`Cuentas de transferencia encontradas: ${accounts.length}`)
    accounts.forEach(acc => {
      console.log(`  - ${acc.org_name}: ${acc.name} (${acc.id})`)
    })
    console.log()

    if (accounts.length === 0) {
      console.log("⚠️  No hay cuentas de transferencia. Creando...")
      const orgs = await prisma.organization.findMany()

      for (const org of orgs) {
        await prisma.$executeRawUnsafe(
          `INSERT INTO transfer_accounts (id, "organizationId", name, "isActive", "createdAt", "updatedAt")
           VALUES (gen_random_uuid()::text, $1, 'Transfer. Leonardo', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          org.id
        )

        await prisma.$executeRawUnsafe(
          `INSERT INTO transfer_accounts (id, "organizationId", name, "isActive", "createdAt", "updatedAt")
           VALUES (gen_random_uuid()::text, $1, 'Transfer. Andrés', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          org.id
        )

        console.log(`  ✓ Cuentas creadas para: ${org.name}`)
      }

      // Recargar cuentas
      const newAccounts = await prisma.$queryRawUnsafe(`
        SELECT ta.id, ta.name, ta."organizationId", o.name as org_name
        FROM transfer_accounts ta
        JOIN organizations o ON ta."organizationId" = o.id
      `)
      accounts.length = 0
      accounts.push(...newAccounts)
      console.log()
    }

    // Ahora migrar los datos sin usar el enum en la comparación
    for (const acc of accounts) {
      let targetValue
      if (acc.name === 'Transfer. Leonardo') {
        targetValue = 'TRANSFERENCIA_HERMANO'
      } else if (acc.name === 'Transfer. Andrés') {
        targetValue = 'TRANSFERENCIA_ANDRES'
      } else {
        continue
      }

      console.log(`Migrando ${targetValue} → ${acc.name}...`)

      // Usar cast a text para evitar problemas con el enum
      const result = await prisma.$executeRawUnsafe(
        `UPDATE cash_movements
         SET method = 'TRANSFERENCIA'::text::"PaymentMethod",
             "transferAccountId" = $1
         WHERE "organizationId" = $2
           AND method::text = $3`,
        acc.id,
        acc.organizationId,
        targetValue
      )

      console.log(`  ✓ ${result} registros actualizados`)
    }

    // Migrar daily_closes
    console.log("\nMigrando cierres diarios...")
    const orgs = await prisma.organization.findMany()

    for (const org of orgs) {
      const orgAccounts = accounts.filter(a => a.organizationId === org.id)
      const leonardoAccount = orgAccounts.find(a => a.name === 'Transfer. Leonardo')
      const andresAccount = orgAccounts.find(a => a.name === 'Transfer. Andrés')

      if (leonardoAccount && andresAccount) {
        const closes = await prisma.$queryRawUnsafe(
          `SELECT id, "totalTransferHermano", "totalTransferAndres"
           FROM daily_closes
           WHERE "organizationId" = $1`,
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
