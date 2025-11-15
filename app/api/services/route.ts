import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"

// Schema de validación para servicio
const serviceSchema = z.object({
  // Datos del cliente (inline, requeridos)
  clientName: z.string().min(1, "El nombre del cliente es requerido"),
  clientPhone: z.string().min(1, "El teléfono es requerido"),
  clientAddress: z.string().optional(),

  // Datos del servicio
  type: z.enum(["FLETE", "MUDANZA", "ESCOMBROS"]),
  status: z.enum(["PENDIENTE", "CONFIRMADO", "FINALIZADO", "CANCELADO"]).default("PENDIENTE"),
  scheduledDate: z.string().or(z.date()),
  price: z.number().positive("El precio debe ser positivo"),

  // Campos opcionales para FLETE/MUDANZA
  origin: z.string().optional(),
  destination: z.string().optional(),
  cargoDescription: z.string().optional(),
  requiresHelper: z.boolean().default(false),

  // Campos opcionales para ESCOMBROS
  debrisType: z.enum(["OBRA", "TIERRA", "MADERA", "ARIDOS", "MIXTO"]).optional(),
  debrisQuantity: z.enum(["PEQUENO", "MEDIO_CAMION", "LLENO"]).optional(),

  notes: z.string().optional(),

  // Opcional: vincular a cliente recurrente
  clientId: z.string().optional(),
})

/**
 * GET /api/services
 * Obtiene todos los servicios con filtros opcionales
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const status = searchParams.get("status")
    const clientId = searchParams.get("clientId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const services = await prisma.service.findMany({
      where: {
        ...(type && { type: type as any }),
        ...(status && { status: status as any }),
        ...(clientId && { clientId }),
        ...(startDate || endDate
          ? {
              scheduledDate: {
                ...(startDate && { gte: new Date(startDate) }),
                ...(endDate && { lte: new Date(endDate) }),
              },
            }
          : {}),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        scheduledDate: "desc",
      },
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json(
      { error: "Error al obtener servicios" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/services
 * Crea un nuevo servicio
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = serviceSchema.parse(body)

    const service = await prisma.service.create({
      data: {
        ...validatedData,
        scheduledDate: new Date(validatedData.scheduledDate),
      },
      include: {
        client: true,
      },
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating service:", error)
    return NextResponse.json(
      { error: "Error al crear servicio" },
      { status: 500 }
    )
  }
}
