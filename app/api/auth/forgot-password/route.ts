import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email es requerido" },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Always return success message to prevent email enumeration
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`)
      return NextResponse.json({
        message: "Si el correo existe, recibirás un enlace de recuperación"
      })
    }

    // Generate reset token
    const token = randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 3600000) // 1 hour from now

    // Save token to database
    await prisma.passwordResetToken.create({
      data: {
        email: user.email,
        token,
        expires,
      },
    })

    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password/${token}`

    // TODO: Send email with reset link
    // For now, just log to console
    console.log("=".repeat(60))
    console.log("PASSWORD RESET REQUESTED")
    console.log("=".repeat(60))
    console.log(`Email: ${email}`)
    console.log(`Reset URL: ${resetUrl}`)
    console.log(`Token expires: ${expires.toLocaleString()}`)
    console.log("=".repeat(60))

    return NextResponse.json({
      message: "Si el correo existe, recibirás un enlace de recuperación"
    })
  } catch (error) {
    console.error("Error in forgot-password:", error)
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    )
  }
}
