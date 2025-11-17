import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getOrganizationId } from "@/lib/session"

// PUT: Actualizar cuenta de transferencia
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = await getOrganizationId()
    const { id } = params
    const body = await request.json()

    const { name, isActive } = body

    // Verificar que la cuenta pertenece a la organización
    const existingAccount = await prisma.transferAccount.findFirst({
      where: {
        id,
        organizationId,
      },
    })

    if (!existingAccount) {
      return NextResponse.json(
        { error: "Cuenta de transferencia no encontrada" },
        { status: 404 }
      )
    }

    // Si se está cambiando el nombre, verificar que no exista otra cuenta con ese nombre
    if (name && name !== existingAccount.name) {
      const duplicate = await prisma.transferAccount.findFirst({
        where: {
          organizationId,
          name,
          id: {
            not: id,
          },
        },
      })

      if (duplicate) {
        return NextResponse.json(
          { error: "Ya existe una cuenta de transferencia con ese nombre" },
          { status: 400 }
        )
      }
    }

    const account = await prisma.transferAccount.update({
      where: {
        id,
      },
      data: {
        name: name ?? existingAccount.name,
        isActive: isActive ?? existingAccount.isActive,
      },
    })

    return NextResponse.json(account)
  } catch (error) {
    console.error("Error al actualizar cuenta de transferencia:", error)
    return NextResponse.json(
      { error: "Error al actualizar cuenta de transferencia" },
      { status: 500 }
    )
  }
}

// DELETE: Eliminar cuenta de transferencia
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = await getOrganizationId()
    const { id } = params

    // Verificar que la cuenta pertenece a la organización
    const account = await prisma.transferAccount.findFirst({
      where: {
        id,
        organizationId,
      },
    })

    if (!account) {
      return NextResponse.json(
        { error: "Cuenta de transferencia no encontrada" },
        { status: 404 }
      )
    }

    // Verificar si hay movimientos asociados a esta cuenta
    const movementCount = await prisma.cashMovement.count({
      where: {
        transferAccountId: id,
      },
    })

    if (movementCount > 0) {
      return NextResponse.json(
        {
          error: "No se puede eliminar la cuenta porque tiene movimientos de caja asociados",
          movementCount
        },
        { status: 400 }
      )
    }

    await prisma.transferAccount.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar cuenta de transferencia:", error)
    return NextResponse.json(
      { error: "Error al eliminar cuenta de transferencia" },
      { status: 500 }
    )
  }
}
