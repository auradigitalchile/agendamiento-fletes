import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getOrganizationId } from "@/lib/session"

/**
 * PATCH /api/services/[id]/toggle-complete
 * Cambia el estado de completado/pendiente de un servicio
 * Si se marca como completado, crea automáticamente un movimiento de caja
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

    const willBeArchived = !existingService.archived

    // Usar transacción para actualizar servicio y crear movimiento de caja
    const result = await prisma.$transaction(async (tx) => {
      // Toggle del estado archived
      const service = await tx.service.update({
        where: { id: params.id },
        data: {
          archived: willBeArchived,
        },
        include: {
          client: true,
        },
      })

      // Si se marca como completado, crear movimiento de caja
      if (willBeArchived) {
        // Verificar si ya existe un movimiento para este servicio
        const existingMovement = await tx.cashMovement.findFirst({
          where: {
            relatedService: params.id,
            organizationId,
          },
        })

        // Solo crear si no existe
        if (!existingMovement) {
          await tx.cashMovement.create({
            data: {
              organizationId,
              type: "INGRESO",
              amount: existingService.price,
              method: "EFECTIVO", // Por defecto efectivo, se puede editar después
              category: "Servicio",
              description: `${existingService.type} - ${existingService.clientName}`,
              relatedService: params.id,
              date: existingService.scheduledDate,
            },
          })
        }
      } else {
        // Si se desmarca como completado, eliminar el movimiento asociado
        await tx.cashMovement.deleteMany({
          where: {
            relatedService: params.id,
            organizationId,
          },
        })
      }

      return service
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error toggling service completion:", error)
    return NextResponse.json(
      { error: "Error al cambiar estado del servicio" },
      { status: 500 }
    )
  }
}
