import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getOrganizationId } from "@/lib/session"

/**
 * PATCH /api/services/[id]/toggle-complete
 * Cambia el estado de completado/pendiente de un servicio
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = await getOrganizationId()

    // Verificar que el servicio pertenece a la organización del usuario
    const existingService = await prisma.service.findFirst({
      where: { id: params.id, organizationId },
    })

    if (!existingService) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 }
      )
    }

    // Toggle del estado archived
    const service = await prisma.service.update({
      where: { id: params.id },
      data: {
        archived: !existingService.archived,
      },
      include: {
        client: true,
      },
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error("Error toggling service completion:", error)
    return NextResponse.json(
      { error: "Error al cambiar estado del servicio" },
      { status: 500 }
    )
  }
}
