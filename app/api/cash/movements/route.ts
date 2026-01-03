import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getOrganizationId } from "@/lib/session"
import { startOfDay, endOfDay } from "date-fns"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/cash/movements - Obtener movimientos
export async function GET(request: NextRequest) {
  try {
    const organizationId = await getOrganizationId()
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const type = searchParams.get("type")

    const where: any = { organizationId }

    if (startDate) {
      where.date = { ...where.date, gte: startOfDay(new Date(startDate)) }
    }

    if (endDate) {
      where.date = { ...where.date, lte: endOfDay(new Date(endDate)) }
    }

    if (type) {
      where.type = type
    }

    const movements = await prisma.cashMovement.findMany({
      where,
      orderBy: { date: "desc" },
    })

    return NextResponse.json(movements)
  } catch (error) {
    console.error("Error fetching cash movements:", error)
    return NextResponse.json(
      { error: "Error al obtener movimientos" },
      { status: 500 }
    )
  }
}

// POST /api/cash/movements - Crear movimiento
export async function POST(request: NextRequest) {
  try {
    const organizationId = await getOrganizationId()
    const body = await request.json()

    // Obtener fecha actual en zona horaria de Chile si no se proporciona
    let movementDate: Date
    if (body.date) {
      movementDate = new Date(body.date)
    } else {
      // Usar zona horaria de Chile para la fecha actual
      const now = new Date()
      const chileTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Santiago" }))
      movementDate = chileTime
    }

    const movement = await prisma.cashMovement.create({
      data: {
        organizationId,
        type: body.type,
        amount: parseFloat(body.amount),
        method: body.method,
        transferAccountId: body.transferAccountId || null,
        category: body.category || null,
        description: body.description || null,
        relatedService: body.relatedService || null,
        date: movementDate,
      },
    })

    return NextResponse.json(movement, { status: 201 })
  } catch (error) {
    console.error("Error creating cash movement:", error)
    return NextResponse.json(
      { error: "Error al crear movimiento" },
      { status: 500 }
    )
  }
}
