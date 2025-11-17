import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    const { newEmail } = await request.json()

    if (!newEmail || !newEmail.includes("@")) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      )
    }

    // Check if email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email ya está en uso" },
        { status: 400 }
      )
    }

    // Generate verification token
    const token = randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 3600000) // 1 hour from now

    // Save email change request
    await prisma.emailChangeRequest.create({
      data: {
        userId: session.user.id,
        newEmail,
        token,
        expires,
      },
    })

    // Create verification URL
    const verifyUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify-email/${token}`

    // TODO: Send email with verification link
    // For now, just log to console
    console.log("=".repeat(60))
    console.log("EMAIL CHANGE REQUESTED")
    console.log("=".repeat(60))
    console.log(`User ID: ${session.user.id}`)
    console.log(`Current Email: ${session.user.email}`)
    console.log(`New Email: ${newEmail}`)
    console.log(`Verification URL: ${verifyUrl}`)
    console.log(`Token expires: ${expires.toLocaleString()}`)
    console.log("=".repeat(60))

    return NextResponse.json({
      message: "Se ha enviado un enlace de verificación a tu nuevo correo"
    })
  } catch (error) {
    console.error("Error requesting email change:", error)
    return NextResponse.json(
      { error: "Error al solicitar cambio de email" },
      { status: 500 }
    )
  }
}
