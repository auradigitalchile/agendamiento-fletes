import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { endOfDay } from "date-fns"
import { getOrganizationId } from "@/lib/session"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/cash/capital - Calcular capital acumulado histórico
export async function GET(request: NextRequest) {
  try {
    const organizationId = await getOrganizationId()
    const { searchParams } = new URL(request.url)
    const endDateParam = searchParams.get("endDate")

    // Obtener configuración de fecha inicio de contabilidad
    const config = await prisma.configuration.findUnique({
      where: { organizationId },
    })

    let startDate: Date
    if (config?.startTrackingDate) {
      startDate = config.startTrackingDate
    } else {
      // Si no hay configuración, usar fecha del primer movimiento
      const firstMovement = await prisma.cashMovement.findFirst({
        where: { organizationId },
        orderBy: { date: "asc" },
      })
      startDate = firstMovement ? firstMovement.date : new Date()
    }

    // Fecha fin (default: hoy)
    let endDate: Date
    if (endDateParam) {
      endDate = endOfDay(new Date(endDateParam))
    } else {
      endDate = endOfDay(new Date())
    }

    // Obtener todos los movimientos desde el inicio hasta la fecha fin
    const movements = await prisma.cashMovement.findMany({
      where: {
        organizationId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    // Calcular capital acumulado
    const totalIngresos = movements
      .filter((m) => m.type === "INGRESO")
      .reduce((sum, m) => sum + m.amount, 0)

    const totalGastos = movements
      .filter((m) => m.type === "GASTO")
      .reduce((sum, m) => sum + m.amount, 0)

    const capitalAcumulado = totalIngresos - totalGastos

    return NextResponse.json({
      capitalAcumulado,
      totalIngresos,
      totalGastos,
      startDate,
      endDate,
    })
  } catch (error) {
    console.error("Error calculating accumulated capital:", error)
    return NextResponse.json(
      { error: "Error al calcular capital acumulado" },
      { status: 500 }
    )
  }
}
