import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, organizationName } = await request.json()

    // Validar datos
    if (!email || !password || !name || !organizationName) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      )
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email ya está registrado" },
        { status: 400 }
      )
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear slug para la organización
    const slug = organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Verificar si el slug ya existe
    let finalSlug = slug
    let counter = 1
    while (await prisma.organization.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter}`
      counter++
    }

    // Crear usuario, organización y cuentas de transferencia por defecto en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear usuario
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
      })

      // Crear organización
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          slug: finalSlug,
        },
      })

      // Vincular usuario a organización como OWNER
      await tx.userOrganization.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: "OWNER",
        },
      })

      // Crear cuentas de transferencia por defecto
      await tx.transferAccount.create({
        data: {
          organizationId: organization.id,
          name: "Transfer. Leonardo",
          isActive: true,
        },
      })

      await tx.transferAccount.create({
        data: {
          organizationId: organization.id,
          name: "Transfer. Andrés",
          isActive: true,
        },
      })

      return { user, organization }
    })

    return NextResponse.json({
      message: "Usuario creado exitosamente",
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
    })
  } catch (error) {
    console.error("Error al registrar usuario:", error)
    return NextResponse.json(
      { error: "Error al crear el usuario" },
      { status: 500 }
    )
  }
}
