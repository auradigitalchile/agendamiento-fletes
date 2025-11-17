import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getOrganizationId } from "@/lib/session"

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
      where.date = { ...where.date, gte: new Date(startDate) }
    }

    if (endDate) {
      where.date = { ...where.date, lte: new Date(endDate) }
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

    const movement = await prisma.cashMovement.create({
      data: {
        organizationId,
        type: body.type,
        amount: parseFloat(body.amount),
        method: body.method,
        category: body.category,
        description: body.description,
        relatedService: body.relatedService,
        date: body.date ? new Date(body.date) : new Date(),
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
