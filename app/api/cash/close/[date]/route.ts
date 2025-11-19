import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfDay } from "date-fns"
import { getOrganizationId } from "@/lib/session"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/cash/close/[date] - Obtener cierre por fecha específica
export async function GET(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  try {
    const organizationId = await getOrganizationId()
    const dateString = params.date

    // Buscar el cierre para esta fecha
    const dailyClose = await prisma.dailyClose.findFirst({
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

    return NextResponse.json(dailyClose)
  } catch (error) {
    console.error("Error fetching daily close:", error)
    return NextResponse.json(
      { error: "Error al obtener cierre" },
      { status: 500 }
    )
  }
}
