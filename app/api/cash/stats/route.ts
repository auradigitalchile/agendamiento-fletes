import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay, subWeeks, format } from "date-fns"
import { getOrganizationId } from "@/lib/session"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/cash/stats - Obtener estadísticas de caja
export async function GET(request: NextRequest) {
  try {
    const organizationId = await getOrganizationId()
    const { searchParams } = new URL(request.url)
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")

    // Por defecto: últimos 30 días
    const endDate = endDateParam ? new Date(endDateParam) : new Date()
    const startDate = startDateParam
      ? new Date(startDateParam)
      : subWeeks(endDate, 4)

    const where = {
      organizationId,
      date: {
        gte: startOfDay(startDate),
        lte: endOfDay(endDate),
      },
    }

    // Obtener todos los movimientos del período
    const movements = await prisma.cashMovement.findMany({
      where,
      orderBy: { date: "asc" },
    })

    // Calcular totales
    const ingresos = movements.filter((m) => m.type === "INGRESO")
    const gastos = movements.filter((m) => m.type === "GASTO")

    const totalIngresos = ingresos.reduce((sum, m) => sum + m.amount, 0)
    const totalGastos = gastos.reduce((sum, m) => sum + m.amount, 0)
    const balance = totalIngresos - totalGastos

    // Totales por método de pago (solo ingresos)
    const efectivo = ingresos
      .filter((m) => m.method === "EFECTIVO")
      .reduce((sum, m) => sum + m.amount, 0)

    // Obtener todas las cuentas de transferencia activas
    const transferAccounts = await prisma.transferAccount.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      orderBy: { createdAt: "asc" },
    })

    // Calcular totales por cuenta de transferencia
    const transferencias = transferAccounts.map((account) => {
      const total = ingresos
        .filter((m) => m.method === "TRANSFERENCIA" && m.transferAccountId === account.id)
        .reduce((sum, m) => sum + m.amount, 0)

      return {
        accountId: account.id,
        accountName: account.name,
        total,
      }
    })

    // Ingresos por categoría
    const ingresosGrouped = ingresos.reduce((acc, m) => {
      const category = m.category || "Sin categoría"
      acc[category] = (acc[category] || 0) + m.amount
      return acc
    }, {} as Record<string, number>)

    const ingresosPorCategoria = Object.entries(ingresosGrouped).map(
      ([category, total]) => ({
        category,
        total,
      })
    )

    // Gastos por categoría
    const gastosGrouped = gastos.reduce((acc, m) => {
      const category = m.category || "Sin categoría"
      acc[category] = (acc[category] || 0) + m.amount
      return acc
    }, {} as Record<string, number>)

    const gastosPorCategoria = Object.entries(gastosGrouped).map(
      ([category, total]) => ({
        category,
        total,
      })
    )

    // Ingresos últimas 4 semanas
    const ingresosUltimas4Semanas = []
    for (let i = 3; i >= 0; i--) {
      const weekStart = subWeeks(endDate, i + 1)
      const weekEnd = subWeeks(endDate, i)

      const weekIngresos = ingresos
        .filter((m) => {
          const date = new Date(m.date)
          return date >= weekStart && date <= weekEnd
        })
        .reduce((sum, m) => sum + m.amount, 0)

      ingresosUltimas4Semanas.push({
        semana: format(weekEnd, "dd/MM"),
        total: weekIngresos,
      })
    }

    const stats = {
      totalIngresos,
      totalGastos,
      balance,
      efectivo,
      transferencias,
      ingresosPorCategoria,
      gastosPorCategoria,
      ingresosUltimas4Semanas,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching cash stats:", error)
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    )
  }
}
