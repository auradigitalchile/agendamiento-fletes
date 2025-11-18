const { PrismaClient } = require('@prisma/client')
const { randomUUID } = require('crypto')

const prisma = new PrismaClient()

async function runMigration() {
  console.log('🚀 Iniciando migración de datos...\n')

  try {
    // 1. Obtener todas las organizaciones
    const organizations = await prisma.organization.findMany()
    console.log(`📊 Encontradas ${organizations.length} organizaciones\n`)

    for (const org of organizations) {
      console.log(`🏢 Procesando organización: ${org.name} (${org.slug})`)

      // 2. Verificar si ya existen cuentas activas
      let accounts = await prisma.transferAccount.findMany({
        where: {
          organizationId: org.id,
          isActive: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      })

      let account1Id = accounts[0]?.id
      let account2Id = accounts[1]?.id

      // 3. Crear cuentas si no existen
      if (!account1Id) {
        const account1 = await prisma.transferAccount.create({
          data: {
            organizationId: org.id,
            name: 'Transfer. Andrés',
            isActive: true
          }
        })
        account1Id = account1.id
        console.log(`  ✅ Creada cuenta 1: Transfer. Andrés`)
      }

      if (!account2Id) {
        const account2 = await prisma.transferAccount.create({
          data: {
            organizationId: org.id,
            name: 'Transfer. Leonardo',
            isActive: true
          }
        })
        account2Id = account2.id
        console.log(`  ✅ Creada cuenta 2: Transfer. Leonardo`)
      }

      // 4. Migrar movimientos TRANSFERENCIA_ANDRES
      const andresUpdated = await prisma.$executeRaw`
        UPDATE cash_movements
        SET
          method = 'TRANSFERENCIA'::"PaymentMethod",
          "transferAccountId" = ${account1Id}
        WHERE "organizationId" = ${org.id}
          AND method::text = 'TRANSFERENCIA_ANDRES'
          AND "transferAccountId" IS NULL
      `

      if (andresUpdated > 0) {
        console.log(`  ✅ Migrados ${andresUpdated} movimientos de TRANSFERENCIA_ANDRES`)
      }

      // 5. Migrar movimientos TRANSFERENCIA_HERMANO
      const hermanoUpdated = await prisma.$executeRaw`
        UPDATE cash_movements
        SET
          method = 'TRANSFERENCIA'::"PaymentMethod",
          "transferAccountId" = ${account2Id}
        WHERE "organizationId" = ${org.id}
          AND method::text = 'TRANSFERENCIA_HERMANO'
          AND "transferAccountId" IS NULL
      `

      if (hermanoUpdated > 0) {
        console.log(`  ✅ Migrados ${hermanoUpdated} movimientos de TRANSFERENCIA_HERMANO`)
      }

      console.log('')
    }

    console.log('✅ Migración completada exitosamente!\n')
    console.log('📊 Verificando resultados...\n')

    // 6. Verificar que no queden movimientos pendientes
    const pendingMovements = await prisma.$queryRaw`
      SELECT
        o.name as organizacion,
        COUNT(*)::int as movimientos_pendientes
      FROM cash_movements cm
      JOIN organizations o ON o.id = cm."organizationId"
      WHERE cm.method::text IN ('TRANSFERENCIA_ANDRES', 'TRANSFERENCIA_HERMANO')
      GROUP BY o.name
    `

    if (pendingMovements.length === 0) {
      console.log('✅ No hay movimientos pendientes de migrar\n')
    } else {
      console.log('⚠️  Movimientos pendientes:')
      console.table(pendingMovements)
    }

    // 7. Mostrar resumen de cuentas
    const accounts = await prisma.transferAccount.findMany({
      include: {
        organization: {
          select: { name: true }
        }
      },
      orderBy: [
        { organization: { name: 'asc' } },
        { createdAt: 'asc' }
      ]
    })

    console.log('📋 Cuentas de transferencia en el sistema:')
    accounts.forEach(acc => {
      console.log(`  - ${acc.organization.name}: ${acc.name} (${acc.isActive ? 'Activa' : 'Inactiva'})`)
    })

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

runMigration()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
