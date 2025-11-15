import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/cash/movements/[id] - Obtener un movimiento
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const movement = await prisma.cashMovement.findUnique({
      where: { id: params.id },
    })

    if (!movement) {
      return NextResponse.json(
        { error: "Movimiento no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(movement)
  } catch (error) {
    console.error("Error fetching cash movement:", error)
    return NextResponse.json(
      { error: "Error al obtener movimiento" },
      { status: 500 }
    )
  }
}

// PATCH /api/cash/movements/[id] - Actualizar un movimiento
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const movement = await prisma.cashMovement.update({
      where: { id: params.id },
      data: {
        ...(body.type && { type: body.type }),
        ...(body.amount && { amount: parseFloat(body.amount) }),
        ...(body.method && { method: body.method }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.date && { date: new Date(body.date) }),
      },
    })

    return NextResponse.json(movement)
  } catch (error) {
    console.error("Error updating cash movement:", error)
    return NextResponse.json(
      { error: "Error al actualizar movimiento" },
      { status: 500 }
    )
  }
}

// DELETE /api/cash/movements/[id] - Eliminar un movimiento
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.cashMovement.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting cash movement:", error)
    return NextResponse.json(
      { error: "Error al eliminar movimiento" },
      { status: 500 }
    )
  }
}
