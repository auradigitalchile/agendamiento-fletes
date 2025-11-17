const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkTransferAccounts() {
  try {
    console.log('🔍 Verificando cuentas de transferencia en la base de datos...\n')

    // Obtener todas las organizaciones
    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
    })

    console.log(`📊 Total de organizaciones: ${organizations.length}\n`)

    // Para cada organización, mostrar sus cuentas de transferencia
    for (const org of organizations) {
      console.log(`🏢 Organización: ${org.name} (${org.slug})`)
      console.log(`   ID: ${org.id}`)

      const accounts = await prisma.transferAccount.findMany({
        where: {
          organizationId: org.id,
        },
        orderBy: {
          name: 'asc',
        },
      })

      if (accounts.length === 0) {
        console.log('   ⚠️  No tiene cuentas de transferencia')
      } else {
        console.log(`   ✅ ${accounts.length} cuenta(s) de transferencia:`)
        accounts.forEach((acc) => {
          console.log(
            `      - ${acc.name} (${acc.isActive ? 'Activa' : 'Inactiva'}) - ID: ${acc.id}`
          )
        })
      }
      console.log('')
    }

    // Verificar si hay movimientos de caja usando cuentas de transferencia
    const movementsWithTransfer = await prisma.cashMovement.count({
      where: {
        transferAccountId: {
          not: null,
        },
      },
    })

    console.log(`💰 Movimientos de caja con cuenta de transferencia: ${movementsWithTransfer}`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTransferAccounts()
