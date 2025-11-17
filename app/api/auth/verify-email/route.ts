import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: "Token es requerido" },
        { status: 400 }
      )
    }

    // Find email change request
    const changeRequest = await prisma.emailChangeRequest.findUnique({
      where: { token },
    })

    if (!changeRequest) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (changeRequest.expires < new Date()) {
      return NextResponse.json(
        { error: "El token ha expirado" },
        { status: 400 }
      )
    }

    // Check if token was already used
    if (changeRequest.used) {
      return NextResponse.json(
        { error: "El token ya fue utilizado" },
        { status: 400 }
      )
    }

    // Check if new email is still available
    const existingUser = await prisma.user.findUnique({
      where: { email: changeRequest.newEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email ya está en uso" },
        { status: 400 }
      )
    }

    // Update user email and mark request as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: changeRequest.userId },
        data: { email: changeRequest.newEmail },
      }),
      prisma.emailChangeRequest.update({
        where: { id: changeRequest.id },
        data: { used: true },
      }),
    ])

    return NextResponse.json({
      message: "Email actualizado exitosamente"
    })
  } catch (error) {
    console.error("Error verifying email:", error)
    return NextResponse.json(
      { error: "Error al verificar el email" },
      { status: 500 }
    )
  }
}
