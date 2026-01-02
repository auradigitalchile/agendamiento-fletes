import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getOrganizationId } from "@/lib/session"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

// DELETE /api/categories/[id] - Desactivar categoría (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = await getOrganizationId()
    const categoryId = params.id

    // Verificar que la categoría pertenezca a la organización
    const category = await prisma.category.findFirst({
      where: { id: categoryId, organizationId },
    })

    if (!category) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      )
    }

    // Soft delete: marcar como inactiva
    await prisma.category.update({
      where: { id: categoryId },
      data: { isActive: false },
    })

    return NextResponse.json({ message: "Categoría desactivada" })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json(
      { error: "Error al eliminar categoría" },
      { status: 500 }
    )
  }
}

// PATCH /api/categories/[id] - Reactivar categoría
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = await getOrganizationId()
    const categoryId = params.id

    // Verificar que la categoría pertenezca a la organización
    const category = await prisma.category.findFirst({
      where: { id: categoryId, organizationId },
    })

    if (!category) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      )
    }

    // Reactivar categoría
    await prisma.category.update({
      where: { id: categoryId },
      data: { isActive: true },
    })

    return NextResponse.json({ message: "Categoría reactivada" })
  } catch (error) {
    console.error("Error reactivating category:", error)
    return NextResponse.json(
      { error: "Error al reactivar categoría" },
      { status: 500 }
    )
  }
}
