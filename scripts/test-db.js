// Script para probar conexión a base de datos
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Probando conexión a base de datos...\n')

  try {
    // Probar conexión
    await prisma.$connect()
    console.log('✅ Conexión exitosa a la base de datos\n')

    // Contar servicios
    const serviceCount = await prisma.service.count()
    console.log(`📊 Servicios en base de datos: ${serviceCount}`)

    // Contar clientes
    const clientCount = await prisma.client.count()
    console.log(`👥 Clientes en base de datos: ${clientCount}\n`)

    // Listar algunos servicios
    if (serviceCount > 0) {
      const services = await prisma.service.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
      })
      console.log('🚚 Últimos servicios:')
      services.forEach(s => {
        console.log(`  - ${s.type} - ${s.clientName} - $${s.price}`)
      })
    } else {
      console.log('⚠️  No hay servicios en la base de datos')
      console.log('💡 Esto es normal para una base de datos nueva')
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('\n📋 Detalles del error:')
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
