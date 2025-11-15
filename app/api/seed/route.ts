import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { CashMovementType, PaymentMethod, Prisma } from "@prisma/client"

// GET /api/seed - Crear datos de ejemplo para Caja
export async function GET() {
  try {
    // Verificar si ya existen datos
    const existingMovements = await prisma.cashMovement.findMany({
      take: 1,
    })

    if (existingMovements.length > 0) {
      return NextResponse.json({
        message: "Ya existen datos en la base de datos. No se crearon datos de ejemplo.",
        warning: "Si quieres recrear los datos, elimina primero los existentes.",
      })
    }

    const organizationId = "temp-org-id"
    const now = new Date()

    // Crear movimientos de ejemplo de los últimos 30 días
    const movements: Prisma.CashMovementCreateManyInput[] = []

    // Semana 1 (hace 21-28 días)
    for (let i = 28; i >= 22; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)

      movements.push(
        {
          organizationId,
          type: CashMovementType.INGRESO,
          amount: 45000,
          method: PaymentMethod.EFECTIVO,
          category: "Servicio Flete",
          description: "Flete centro a Providencia",
          date,
        },
        {
          organizationId,
          type: CashMovementType.INGRESO,
          amount: 65000,
          method: PaymentMethod.TRANSFERENCIA_ANDRES,
          category: "Servicio Mudanza",
          description: "Mudanza departamento",
          date,
        },
        {
          organizationId,
          type: CashMovementType.GASTO,
          amount: 15000,
          method: PaymentMethod.EFECTIVO,
          category: "Combustible",
          description: "Bencina",
          date,
        }
      )
    }

    // Semana 2 (hace 14-21 días)
    for (let i = 21; i >= 15; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)

      movements.push(
        {
          organizationId,
          type: CashMovementType.INGRESO,
          amount: 55000,
          method: PaymentMethod.EFECTIVO,
          category: "Servicio Flete",
          description: "Flete industrial",
          date,
        },
        {
          organizationId,
          type: CashMovementType.INGRESO,
          amount: 85000,
          method: PaymentMethod.TRANSFERENCIA_HERMANO,
          category: "Servicio Escombros",
          description: "Retiro escombros obra",
          date,
        },
        {
          organizationId,
          type: CashMovementType.GASTO,
          amount: 12000,
          method: PaymentMethod.EFECTIVO,
          category: "Mantención",
          description: "Revisión técnica",
          date,
        },
        {
          organizationId,
          type: CashMovementType.GASTO,
          amount: 8000,
          method: PaymentMethod.EFECTIVO,
          category: "Peajes",
          description: "Peajes autopista",
          date,
        }
      )
    }

    // Semana 3 (hace 7-14 días)
    for (let i = 14; i >= 8; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)

      movements.push(
        {
          organizationId,
          type: CashMovementType.INGRESO,
          amount: 75000,
          method: PaymentMethod.TRANSFERENCIA_ANDRES,
          category: "Servicio Mudanza",
          description: "Mudanza oficina",
          date,
        },
        {
          organizationId,
          type: CashMovementType.INGRESO,
          amount: 95000,
          method: PaymentMethod.TRANSFERENCIA_HERMANO,
          category: "Servicio Mudanza",
          description: "Mudanza casa completa",
          date,
        },
        {
          organizationId,
          type: CashMovementType.INGRESO,
          amount: 40000,
          method: PaymentMethod.EFECTIVO,
          category: "Servicio Flete",
          description: "Flete muebles",
          date,
        },
        {
          organizationId,
          type: CashMovementType.GASTO,
          amount: 20000,
          method: PaymentMethod.EFECTIVO,
          category: "Combustible",
          description: "Bencina full",
          date,
        }
      )
    }

    // Semana 4 (últimos 7 días)
    for (let i = 7; i >= 1; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)

      movements.push(
        {
          organizationId,
          type: CashMovementType.INGRESO,
          amount: 60000,
          method: PaymentMethod.EFECTIVO,
          category: "Servicio Flete",
          description: "Flete electrodomésticos",
          date,
        },
        {
          organizationId,
          type: CashMovementType.INGRESO,
          amount: 120000,
          method: PaymentMethod.TRANSFERENCIA_ANDRES,
          category: "Servicio Mudanza",
          description: "Mudanza casa 2 pisos",
          date,
        },
        {
          organizationId,
          type: CashMovementType.GASTO,
          amount: 18000,
          method: PaymentMethod.EFECTIVO,
          category: "Combustible",
          description: "Bencina",
          date,
        },
        {
          organizationId,
          type: CashMovementType.GASTO,
          amount: 25000,
          method: PaymentMethod.EFECTIVO,
          category: "Mantención",
          description: "Cambio aceite",
          date,
        }
      )
    }

    // Hoy - varios movimientos
    movements.push(
      {
        organizationId,
        type: "INGRESO",
        amount: 80000,
        method: "TRANSFERENCIA_ANDRES",
        category: "Servicio Mudanza",
        description: "Mudanza departamento 3 dorm",
        date: now,
      },
      {
        organizationId,
        type: "INGRESO",
        amount: 45000,
        method: "EFECTIVO",
        category: "Servicio Flete",
        description: "Flete materiales construcción",
        date: now,
      },
      {
        organizationId,
        type: "INGRESO",
        amount: 55000,
        method: "TRANSFERENCIA_HERMANO",
        category: "Servicio Escombros",
        description: "Retiro escombros remodelación",
        date: now,
      },
      {
        organizationId,
        type: "GASTO",
        amount: 15000,
        method: "EFECTIVO",
        category: "Combustible",
        description: "Bencina",
        date: now,
      },
      {
        organizationId,
        type: "GASTO",
        amount: 5000,
        method: "EFECTIVO",
        category: "Peajes",
        description: "Peajes del día",
        date: now,
      }
    )

    // Insertar todos los movimientos
    await prisma.cashMovement.createMany({
      data: movements,
    })

    // Crear algunos cierres diarios de ejemplo
    const cierres = []
    for (let i = 10; i >= 3; i--) {
      const closeDate = new Date(now)
      closeDate.setDate(closeDate.getDate() - i)
      closeDate.setHours(0, 0, 0, 0)

      cierres.push({
        organizationId,
        date: closeDate,
        totalCash: Math.floor(Math.random() * 100000) + 50000,
        totalTransferAndres: Math.floor(Math.random() * 150000) + 80000,
        totalTransferHermano: Math.floor(Math.random() * 120000) + 60000,
        totalExpenses: Math.floor(Math.random() * 40000) + 15000,
        finalCash: Math.floor(Math.random() * 80000) + 40000,
        notes: `Cierre del ${closeDate.toLocaleDateString()}`,
      })
    }

    await prisma.dailyClose.createMany({
      data: cierres,
    })

    const totalMovements = movements.length
    const totalCierres = cierres.length

    return NextResponse.json({
      success: true,
      message: "Datos de ejemplo creados exitosamente",
      data: {
        movimientos: totalMovements,
        cierres: totalCierres,
      },
      instrucciones: {
        paso1: "Visita /caja para ver los movimientos de hoy",
        paso2: "Visita /caja/dashboard para ver los gráficos",
        paso3: "Visita /caja/cierre para ver los cierres históricos",
      },
    })
  } catch (error: any) {
    console.error("Error creating seed data:", error)
    return NextResponse.json(
      {
        error: "Error al crear datos de ejemplo",
        details: error.message,
        hint: "Asegúrate de que las tablas estén creadas. Visita /api/setup primero.",
      },
      { status: 500 }
    )
  }
}
