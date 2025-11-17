/**
 * Script de migración de datos para cuentas de transferencia
 *
 * Este script lee y ejecuta el archivo SQL de migración
 * IMPORTANTE: Ejecutar ANTES de hacer `prisma db push` con el nuevo schema
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🔄 Iniciando migración de cuentas de transferencia...\n")

  try {
    // Leer el archivo SQL
    const sqlPath = join(__dirname, 'migrate-transfer-accounts.sql')
    const sql = readFileSync(sqlPath, 'utf-8')

    console.log("📄 Ejecutando script SQL de migración...")

    // Ejecutar el SQL completo
    await prisma.$executeRawUnsafe(sql)

    console.log("\n✅ Migración completada exitosamente\n")
    console.log("🎉 Ahora puedes ejecutar: npx prisma db push\n")
    console.log("   (Ya no será necesario usar --accept-data-loss)\n")

  } catch (error) {
    console.error("❌ Error durante la migración:", error)
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
