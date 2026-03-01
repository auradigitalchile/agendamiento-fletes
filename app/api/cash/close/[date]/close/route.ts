import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfDay } from "date-fns"
import { getOrganizationId } from "@/lib/session"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

// POST /api/cash/close/[date]/close - Cerrar día
export async function POST(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  try {
    const organizationId = await getOrganizationId()
    const dateString = params.date

    // Buscar el cierre para esta fecha
    let dailyClose = await prisma.dailyClose.findFirst({
      where: {
        organizationId,
        date: startOfDay(new Date(dateString)),
      },
    })

    if (!dailyClose) {
      return NextResponse.json(
        { error: "No se encontró cierre para esta fecha. Debe crear un cierre primero." },
        { status: 404 }
      )
    }

    if (dailyClose.status === "CLOSED") {
      return NextResponse.json(
        { error: "Este día ya está cerrado" },
        { status: 400 }
      )
    }

    // Cerrar el día
    dailyClose = await prisma.dailyClose.update({
      where: { id: dailyClose.id },
      data: {
        status: "CLOSED",
        closedAt: new Date(),
      },
    })

    return NextResponse.json(dailyClose)
  } catch (error) {
    console.error("Error closing day:", error)
    return NextResponse.json(
      { error: "Error al cerrar día" },
      { status: 500 }
    )
  }
}
