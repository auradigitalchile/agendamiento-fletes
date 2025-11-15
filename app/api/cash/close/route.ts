import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay } from "date-fns"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// GET /api/cash/close - Obtener cierres diarios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: any = {}

    if (startDate) {
      where.date = { ...where.date, gte: startOfDay(new Date(startDate)) }
    }

    if (endDate) {
      where.date = { ...where.date, lte: endOfDay(new Date(endDate)) }
    }

    const closes = await prisma.dailyClose.findMany({
      where,
      orderBy: { date: "desc" },
    })

    return NextResponse.json(closes)
  } catch (error) {
    console.error("Error fetching daily closes:", error)
    return NextResponse.json(
      { error: "Error al obtener cierres" },
      { status: 500 }
    )
  }
}

// POST /api/cash/close - Crear cierre diario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // TODO: Agregar verificación de autenticación en Fase 3
    const organizationId = "temp-org-id"

    // Verificar si ya existe un cierre para esta fecha
    const existingClose = await prisma.dailyClose.findFirst({
      where: {
        organizationId,
        date: startOfDay(new Date(body.date)),
      },
    })

    if (existingClose) {
      return NextResponse.json(
        { error: "Ya existe un cierre para esta fecha" },
        { status: 400 }
      )
    }

    const dailyClose = await prisma.dailyClose.create({
      data: {
        organizationId,
        date: startOfDay(new Date(body.date)),
        totalCash: parseFloat(body.totalCash),
        totalTransferAndres: parseFloat(body.totalTransferAndres),
        totalTransferHermano: parseFloat(body.totalTransferHermano),
        totalExpenses: parseFloat(body.totalExpenses),
        finalCash: parseFloat(body.finalCash),
        notes: body.notes,
        closedBy: body.closedBy,
      },
    })

    return NextResponse.json(dailyClose, { status: 201 })
  } catch (error) {
    console.error("Error creating daily close:", error)
    return NextResponse.json(
      { error: "Error al crear cierre" },
      { status: 500 }
    )
  }
}
