import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfDay } from "date-fns"
import { getOrganizationId } from "@/lib/session"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

// POST /api/cash/close/[date]/reopen - Reabrir día (solo admin)
export async function POST(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  try {
    const organizationId = await getOrganizationId()
    const dateString = params.date

    // TODO: Agregar validación de rol ADMIN aquí cuando esté disponible
    // const user = await getCurrentUser()
    // if (user.role !== 'ADMIN' && user.role !== 'OWNER') {
    //   return NextResponse.json(
    //     { error: "Solo administradores pueden reabrir días" },
    //     { status: 403 }
    //   )
    // }

    // Buscar el cierre para esta fecha
    let dailyClose = await prisma.dailyClose.findFirst({
      where: {
        organizationId,
        date: startOfDay(new Date(dateString)),
      },
    })

    if (!dailyClose) {
      return NextResponse.json(
        { error: "No se encontró cierre para esta fecha" },
        { status: 404 }
      )
    }

    if (dailyClose.status === "OPEN") {
      return NextResponse.json(
        { error: "Este día ya está abierto" },
        { status: 400 }
      )
    }

    // Reabrir el día
    dailyClose = await prisma.dailyClose.update({
      where: { id: dailyClose.id },
      data: {
        status: "OPEN",
        closedAt: null,
      },
    })

    return NextResponse.json(dailyClose)
  } catch (error) {
    console.error("Error reopening day:", error)
    return NextResponse.json(
      { error: "Error al reabrir día" },
      { status: 500 }
    )
  }
}
