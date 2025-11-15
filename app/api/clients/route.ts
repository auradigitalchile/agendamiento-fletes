import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"

// Schema de validación para cliente
const clientSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  phone: z.string().min(1, "El teléfono es requerido"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  defaultAddress: z.string().optional(),
  notes: z.string().optional(),
})

/**
 * GET /api/clients
 * Obtiene todos los clientes
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    const clients = await prisma.client.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { phone: { contains: search } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      include: {
        services: {
          select: {
            id: true,
            type: true,
            scheduledDate: true,
            status: true,
            price: true,
          },
          orderBy: {
            scheduledDate: "desc",
          },
          take: 5,
        },
        _count: {
          select: { services: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json(
      { error: "Error al obtener clientes" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/clients
 * Crea un nuevo cliente
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = clientSchema.parse(body)

    const client = await prisma.client.create({
      data: {
        ...validatedData,
        email: validatedData.email || null,
      },
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating client:", error)
    return NextResponse.json(
      { error: "Error al crear cliente" },
      { status: 500 }
    )
  }
}
