import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getOrganizationId } from "@/lib/session"

// GET: Obtener todas las cuentas de transferencia de la organización
export async function GET(request: NextRequest) {
  try {
    console.log("🔍 GET /api/transfer-accounts - Inicio")
    const organizationId = await getOrganizationId()
    console.log("📊 Organization ID:", organizationId)

    const accounts = await prisma.transferAccount.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        name: "asc",
      },
    })

    console.log(`✅ Encontradas ${accounts.length} cuentas de transferencia`)
    console.log("📋 Cuentas:", accounts.map(a => ({ id: a.id, name: a.name })))

    return NextResponse.json(accounts)
  } catch (error) {
    console.error("❌ Error al obtener cuentas de transferencia:", error)
    return NextResponse.json(
      { error: "Error al obtener cuentas de transferencia" },
      { status: 500 }
    )
  }
}

// POST: Crear nueva cuenta de transferencia
export async function POST(request: NextRequest) {
  try {
    const organizationId = await getOrganizationId()
    const body = await request.json()

    const { name } = body

    if (!name) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      )
    }

    // Verificar que no exista una cuenta con el mismo nombre en esta organización
    const existing = await prisma.transferAccount.findFirst({
      where: {
        organizationId,
        name,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta de transferencia con ese nombre" },
        { status: 400 }
      )
    }

    const account = await prisma.transferAccount.create({
      data: {
        organizationId,
        name,
        isActive: true,
      },
    })

    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    console.error("Error al crear cuenta de transferencia:", error)
    return NextResponse.json(
      { error: "Error al crear cuenta de transferencia" },
      { status: 500 }
    )
  }
}
