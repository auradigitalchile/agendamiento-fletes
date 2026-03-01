import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay, format, eachDayOfInterval } from "date-fns"
import { getOrganizationId } from "@/lib/session"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/cash/kpis - Obtener KPIs financieros
export async function GET(request: NextRequest) {
  try {
    const organizationId = await getOrganizationId()
    const { searchParams } = new URL(request.url)
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")

    if (!startDateParam || !endDateParam) {
      return NextResponse.json(
        { error: "Se requieren startDate y endDate" },
        { status: 400 }
      )
    }

    const startDate = new Date(startDateParam)
    const endDate = new Date(endDateParam)

    // Obtener movimientos del período
    const movements = await prisma.cashMovement.findMany({
      where: {
        organizationId,
        date: {
          gte: startOfDay(startDate),
          lte: endOfDay(endDate),
        },
      },
      orderBy: { date: "asc" },
    })

    // Obtener servicios completados/finalizados del período
    const services = await prisma.service.findMany({
      where: {
        organizationId,
        scheduledDate: {
          gte: startOfDay(startDate),
          lte: endOfDay(endDate),
        },
        status: "FINALIZADO",
      },
    })

    const ingresos = movements.filter((m) => m.type === "INGRESO")
    const gastos = movements.filter((m) => m.type === "GASTO")

    const totalIngresos = ingresos.reduce((sum, m) => sum + m.amount, 0)
    const totalGastos = gastos.reduce((sum, m) => sum + m.amount, 0)

    // 1. Ganancia diaria (serie temporal)
    const days = eachDayOfInterval({ start: startDate, end: endDate })
    const gananciaDiaria = days.map((day) => {
      const dayStart = startOfDay(day)
      const dayEnd = endOfDay(day)

      const dayIngresos = movements
        .filter((m) => m.type === "INGRESO" && m.date >= dayStart && m.date <= dayEnd)
        .reduce((sum, m) => sum + m.amount, 0)

      const dayGastos = movements
        .filter((m) => m.type === "GASTO" && m.date >= dayStart && m.date <= dayEnd)
        .reduce((sum, m) => sum + m.amount, 0)

      return {
        fecha: format(day, "yyyy-MM-dd"),
        ganancia: dayIngresos - dayGastos,
        ingresos: dayIngresos,
        gastos: dayGastos,
      }
    })

    // 2. Margen promedio
    const margenPromedio = totalIngresos > 0
      ? ((totalIngresos - totalGastos) / totalIngresos) * 100
      : 0

    // 3. Ingreso por servicio
    const totalIngresosServicios = ingresos
      .filter((m) => m.relatedService)
      .reduce((sum, m) => sum + m.amount, 0)

    const cantidadServicios = services.length

    const ingresoPorServicio = cantidadServicios > 0
      ? totalIngresosServicios / cantidadServicios
      : 0

    // Ingresos por tipo de servicio
    const ingresosPorTipoServicio = services.reduce((acc, service) => {
      const serviceIngresos = ingresos
        .filter((m) => m.relatedService === service.id)
        .reduce((sum, m) => sum + m.amount, 0)

      if (!acc[service.type]) {
        acc[service.type] = { total: 0, count: 0 }
      }
      acc[service.type].total += serviceIngresos
      acc[service.type].count += 1

      return acc
    }, {} as Record<string, { total: number; count: number }>)

    const ingresosPorTipo = Object.entries(ingresosPorTipoServicio).map(
      ([tipo, data]) => ({
        tipo,
        total: data.total,
        promedio: data.total / data.count,
        cantidad: data.count,
      })
    )

    const kpis = {
      gananciaDiaria,
      margenPromedio,
      ingresoPorServicio,
      ingresosPorTipo,
      totalIngresos,
      totalGastos,
      balance: totalIngresos - totalGastos,
      cantidadServicios,
    }

    return NextResponse.json(kpis)
  } catch (error) {
    console.error("Error fetching KPIs:", error)
    return NextResponse.json(
      { error: "Error al obtener KPIs" },
      { status: 500 }
    )
  }
}
