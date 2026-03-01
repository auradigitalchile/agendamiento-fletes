import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getOrganizationId } from "@/lib/session"
import { startOfDay, endOfDay } from "date-fns"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

// POST /api/cash/adjustments - Crear ajuste contable
export async function POST(request: NextRequest) {
  try {
    const organizationId = await getOrganizationId()
    const body = await request.json()

    // Validar campos requeridos
    if (!body.type || !body.amount || !body.method || !body.adjustmentReason || !body.date) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    // Verificar que el día está cerrado (solo se permiten ajustes en días cerrados)
    const adjustmentDate = new Date(body.date)
    const dailyClose = await prisma.dailyClose.findFirst({
      where: {
        organizationId,
        date: startOfDay(adjustmentDate),
      },
    })

    if (!dailyClose || dailyClose.status !== "CLOSED") {
      return NextResponse.json(
        { error: "Los ajustes solo se permiten en días cerrados" },
        { status: 400 }
      )
    }

    // Crear el ajuste
    const adjustment = await prisma.cashMovement.create({
      data: {
        organizationId,
        type: body.type,
        amount: parseFloat(body.amount),
        method: body.method,
        transferAccountId: body.transferAccountId || null,
        category: body.category || "Ajuste Contable",
        description: body.description || null,
        relatedService: body.relatedService || null,
        date: adjustmentDate,
        isAdjustment: true,
        adjustmentReason: body.adjustmentReason,
        relatedMovementId: body.relatedMovementId || null,
      },
    })

    return NextResponse.json(adjustment, { status: 201 })
  } catch (error) {
    console.error("Error creating adjustment:", error)
    return NextResponse.json(
      { error: "Error al crear ajuste" },
      { status: 500 }
    )
  }
}
