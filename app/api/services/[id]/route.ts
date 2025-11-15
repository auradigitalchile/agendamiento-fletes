import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"

const serviceSchema = z.object({
  // Datos del cliente (inline, requeridos)
  clientName: z.string().min(1, "El nombre del cliente es requerido"),
  clientPhone: z.string().min(1, "El teléfono es requerido"),
  clientAddress: z.string().optional(),

  // Datos del servicio
  type: z.enum(["FLETE", "MUDANZA", "ESCOMBROS"]),
  status: z.enum(["PENDIENTE", "CONFIRMADO", "FINALIZADO", "CANCELADO"]),
  scheduledDate: z.string().or(z.date()),
  price: z.number().positive("El precio debe ser positivo"),

  // Campos opcionales
  origin: z.string().optional(),
  destination: z.string().optional(),
  cargoDescription: z.string().optional(),
  requiresHelper: z.boolean().default(false),
  debrisType: z.enum(["OBRA", "TIERRA", "MADERA", "ARIDOS", "MIXTO"]).optional(),
  debrisQuantity: z.enum(["PEQUENO", "MEDIO_CAMION", "LLENO"]).optional(),
  notes: z.string().optional(),

  // Opcional: vincular a cliente recurrente
  clientId: z.string().optional(),
})

/**
 * GET /api/services/[id]
 * Obtiene un servicio por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: params.id },
      include: {
        client: true,
      },
    })

    if (!service) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error("Error fetching service:", error)
    return NextResponse.json(
      { error: "Error al obtener servicio" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/services/[id]
 * Actualiza un servicio
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = serviceSchema.parse(body)

    const service = await prisma.service.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        scheduledDate: new Date(validatedData.scheduledDate),
      },
      include: {
        client: true,
      },
    })

    return NextResponse.json(service)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating service:", error)
    return NextResponse.json(
      { error: "Error al actualizar servicio" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/services/[id]
 * Elimina un servicio
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.service.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting service:", error)
    return NextResponse.json(
      { error: "Error al eliminar servicio" },
      { status: 500 }
    )
  }
}
