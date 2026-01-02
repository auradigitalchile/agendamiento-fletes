import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getOrganizationId } from "@/lib/session"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/categories - Obtener categorías activas
export async function GET(request: NextRequest) {
  try {
    const organizationId = await getOrganizationId()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // INGRESO o GASTO

    const where: any = { organizationId, isActive: true }

    if (type) {
      where.type = type
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: "asc" },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "Error al obtener categorías" },
      { status: 500 }
    )
  }
}

// POST /api/categories - Crear nueva categoría
export async function POST(request: NextRequest) {
  try {
    const organizationId = await getOrganizationId()
    const body = await request.json()

    // Validar que el nombre no esté vacío
    if (!body.name || body.name.trim() === "") {
      return NextResponse.json(
        { error: "El nombre de la categoría es requerido" },
        { status: 400 }
      )
    }

    // Normalizar el nombre (capitalizar primera letra, trim)
    const normalizedName = body.name.trim()
      .toLowerCase()
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    // Verificar si ya existe una categoría con el mismo nombre y tipo
    const existingCategory = await prisma.category.findUnique({
      where: {
        organizationId_name_type: {
          organizationId,
          name: normalizedName,
          type: body.type,
        },
      },
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: "Ya existe una categoría con ese nombre para este tipo" },
        { status: 409 }
      )
    }

    const category = await prisma.category.create({
      data: {
        organizationId,
        name: normalizedName,
        type: body.type,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json(
      { error: "Error al crear categoría" },
      { status: 500 }
    )
  }
}
