/**
 * Migración paso a paso del enum PaymentMethod
 */

const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {
  console.log("🔧 Migrando enum PaymentMethod paso a paso...\n")

  try {
    // Paso 1: Agregar "TRANSFERENCIA" al enum existente
    console.log("Paso 1: Agregando TRANSFERENCIA al enum...")
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'TRANSFERENCIA'
      `)
      console.log("✓ TRANSFERENCIA agregado al enum\n")
    } catch (e) {
      console.log("→ TRANSFERENCIA ya existe en el enum\n")
    }

    // Paso 2: Verificar y crear cuentas de transferencia
    console.log("Paso 2: Verificando cuentas de transferencia...")
    const accountCount = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM transfer_accounts
    `)

    if (accountCount[0].count === '0') {
      console.log("→ Creando cuentas...")
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
    } else {
      console.log(`✓ Ya existen ${accountCount[0].count} cuentas\n`)
    }

    // Paso 3: Migrar cash_movements
    console.log("Paso 3: Migrando cash_movements...")
    const accounts = await prisma.$queryRawUnsafe(`
      SELECT ta.id, ta.name, ta."organizationId"
      FROM transfer_accounts ta
    `)

    for (const acc of accounts) {
      let targetValue
      if (acc.name === 'Transfer. Leonardo') {
        targetValue = 'TRANSFERENCIA_HERMANO'
      } else if (acc.name === 'Transfer. Andrés') {
        targetValue = 'TRANSFERENCIA_ANDRES'
      } else {
        continue
      }

      const result = await prisma.$executeRawUnsafe(
        `UPDATE cash_movements
         SET method = 'TRANSFERENCIA'::"PaymentMethod",
             "transferAccountId" = $1
         WHERE "organizationId" = $2
           AND method::text = $3`,
        acc.id,
        acc.organizationId,
        targetValue
      )

      if (result > 0) {
        console.log(`  ✓ ${acc.name}: ${result} movimientos actualizados`)
      }
    }
    console.log()

    // Paso 4: Migrar daily_closes
    console.log("Paso 4: Migrando daily_closes...")
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

        if (closes.length > 0) {
          console.log(`  ✓ ${org.name}: ${closes.length} cierres actualizados`)
        }
      }
    }
    console.log()

    console.log("✅ Migración completada exitosamente\n")
    console.log("🎉 Ahora puedes ejecutar: npx prisma db push\n")

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
