import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { format } from "date-fns"

/**
 * GET /api/export?month=2025-01
 * Exporta servicios del mes en formato CSV
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month") // formato: 2025-01

    if (!month) {
      return NextResponse.json(
        { error: "El parámetro 'month' es requerido (formato: YYYY-MM)" },
        { status: 400 }
      )
    }

    // Parsear mes y año
    const [year, monthNum] = month.split("-").map(Number)
    const startDate = new Date(year, monthNum - 1, 1)
    const endDate = new Date(year, monthNum, 0, 23, 59, 59)

    // Obtener servicios del mes
    const services = await prisma.service.findMany({
      where: {
        scheduledDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        scheduledDate: "asc",
      },
    })

    // Generar CSV
    const headers = [
      "Fecha",
      "Cliente",
      "Teléfono",
      "Tipo",
      "Origen",
      "Destino",
      "Monto",
      "Estado",
      "Notas",
    ]

    const rows = services.map((service) => [
      format(new Date(service.scheduledDate), "dd/MM/yyyy HH:mm"),
      service.clientName,
      service.clientPhone,
      service.type,
      service.origin || "-",
      service.destination || "-",
      service.price,
      service.status,
      service.notes || "-",
    ])

    // Construir CSV
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n")

    // Retornar CSV
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="servicios-${month}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error exporting services:", error)
    return NextResponse.json(
      { error: "Error al exportar servicios" },
      { status: 500 }
    )
  }
}
