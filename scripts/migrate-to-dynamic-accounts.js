/**
 * Script para migrar movimientos de caja de métodos hardcodeados a cuentas dinámicas
 *
 * Convierte:
 * - TRANSFERENCIA_ANDRES -> TRANSFERENCIA + transferAccountId (primera cuenta activa)
 * - TRANSFERENCIA_HERMANO -> TRANSFERENCIA + transferAccountId (segunda cuenta activa)
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function migrate() {
  console.log('🚀 Iniciando migración de cuentas de transferencia...\n')

  try {
    // 1. Obtener todas las organizaciones
    const organizations = await prisma.organization.findMany()
    console.log(`📊 Encontradas ${organizations.length} organizaciones\n`)

    for (const org of organizations) {
      console.log(`\n🏢 Procesando organización: ${org.name} (${org.slug})`)

      // 2. Obtener o crear cuentas de transferencia para esta organización
      let accounts = await prisma.transferAccount.findMany({
        where: { organizationId: org.id, isActive: true },
        orderBy: { createdAt: 'asc' }
      })

      // Si no hay cuentas, crear las predeterminadas
      if (accounts.length === 0) {
        console.log('  ⚠️  No hay cuentas de transferencia, creando predeterminadas...')

        const account1 = await prisma.transferAccount.create({
          data: {
            organizationId: org.id,
            name: 'Transfer. Andrés',
            isActive: true
          }
        })

        const account2 = await prisma.transferAccount.create({
          data: {
            organizationId: org.id,
            name: 'Transfer. Leonardo',
            isActive: true
          }
        })

        accounts = [account1, account2]
        console.log(`  ✅ Creadas 2 cuentas predeterminadas`)
      } else {
        console.log(`  ✅ Encontradas ${accounts.length} cuentas de transferencia activas`)
      }

      const firstAccountId = accounts[0]?.id
      const secondAccountId = accounts[1]?.id || accounts[0]?.id // Si solo hay una, usar la misma

      // 3. Actualizar movimientos con TRANSFERENCIA_ANDRES
      const andresMovements = await prisma.$executeRaw`
        UPDATE cash_movements
        SET
          method = 'TRANSFERENCIA'::"PaymentMethod",
          "transferAccountId" = ${firstAccountId}
        WHERE "organizationId" = ${org.id}
          AND method = 'TRANSFERENCIA_ANDRES'::"PaymentMethod"
          AND "transferAccountId" IS NULL
      `

      if (andresMovements > 0) {
        console.log(`  ✅ Migrados ${andresMovements} movimientos de TRANSFERENCIA_ANDRES a ${accounts[0].name}`)
      }

      // 4. Actualizar movimientos con TRANSFERENCIA_HERMANO
      const hermanoMovements = await prisma.$executeRaw`
        UPDATE cash_movements
        SET
          method = 'TRANSFERENCIA'::"PaymentMethod",
          "transferAccountId" = ${secondAccountId}
        WHERE "organizationId" = ${org.id}
          AND method = 'TRANSFERENCIA_HERMANO'::"PaymentMethod"
          AND "transferAccountId" IS NULL
      `

      if (hermanoMovements > 0) {
        console.log(`  ✅ Migrados ${hermanoMovements} movimientos de TRANSFERENCIA_HERMANO a ${accounts[1]?.name || accounts[0].name}`)
      }

      // 5. Verificar que no queden movimientos sin migrar
      const remaining = await prisma.cashMovement.count({
        where: {
          organizationId: org.id,
          method: 'TRANSFERENCIA',
          transferAccountId: null
        }
      })

      if (remaining > 0) {
        console.log(`  ⚠️  Quedan ${remaining} movimientos de TRANSFERENCIA sin transferAccountId`)
      }
    }

    console.log('\n✅ Migración completada exitosamente!')

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrate()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
