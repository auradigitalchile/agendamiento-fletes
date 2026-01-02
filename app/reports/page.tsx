"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { FileDown, TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { exportServices } from "@/lib/api/services"
import { getCashMovements } from "@/lib/api/cash"
import { formatPrice } from "@/lib/utils"
import { startOfMonth, endOfMonth, format } from "date-fns"

export default function ReportsPage() {
  const [month, setMonth] = useState("")
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"))
  const { toast } = useToast()

  // Obtener movimientos del mes seleccionado
  const { data: movements, isLoading } = useQuery({
    queryKey: ["cash-movements-report", selectedMonth],
    queryFn: () => {
      const startDate = startOfMonth(new Date(selectedMonth + "-01"))
      const endDate = endOfMonth(new Date(selectedMonth + "-01"))
      return getCashMovements({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      })
    },
  })

  // Calcular estadísticas del mes
  const stats = useMemo(() => {
    if (!movements) return null

    const totalIngresos = movements
      .filter((m: any) => m.type === "INGRESO")
      .reduce((sum: number, m: any) => sum + m.amount, 0)

    const totalGastos = movements
      .filter((m: any) => m.type === "GASTO")
      .reduce((sum: number, m: any) => sum + m.amount, 0)

    const balance = totalIngresos - totalGastos

    // Ingresos por método
    const ingresosPorMetodo = movements
      .filter((m: any) => m.type === "INGRESO")
      .reduce((acc: any, m: any) => {
        const key = m.method === "EFECTIVO" ? "efectivo" : "transferencia"
        acc[key] = (acc[key] || 0) + m.amount
        return acc
      }, {})

    // Gastos por categoría
    const gastosPorCategoria = movements
      .filter((m: any) => m.type === "GASTO")
      .reduce((acc: any, m: any) => {
        const cat = m.category || "Sin categoría"
        acc[cat] = (acc[cat] || 0) + m.amount
        return acc
      }, {})

    return {
      totalIngresos,
      totalGastos,
      balance,
      ingresosPorMetodo,
      gastosPorCategoria,
      totalMovimientos: movements.length,
    }
  }, [movements])

  const handleExport = async () => {
    if (!month) {
      toast({
        title: "Error",
        description: "Selecciona un mes para exportar",
        variant: "destructive",
      })
      return
    }

    try {
      await exportServices(month)
      toast({
        title: "Exportación exitosa",
        description: `Servicios del mes ${month} exportados`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo exportar los servicios",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Dashboard Financiero</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Análisis completo de tus finanzas
            </p>
          </div>
        </div>

        {/* Filtro de mes */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div className="flex-1">
              <Label htmlFor="selectedMonth" className="text-sm font-medium text-gray-700">
                Seleccionar Mes y Año
              </Label>
              <Input
                id="selectedMonth"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="mt-1 max-w-xs"
              />
            </div>
          </div>
        </div>

        {/* Resumen Principal */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            Cargando datos financieros...
          </div>
        ) : stats ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="rounded-xl border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Ingresos Totales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">
                      {formatPrice(stats.totalIngresos)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Gastos Totales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <span className="text-2xl font-bold text-red-600">
                      {formatPrice(stats.totalGastos)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <span className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {formatPrice(stats.balance)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Movimientos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {stats.totalMovimientos}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Desglose de Ingresos y Gastos */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Ingresos por Método */}
              <Card className="rounded-xl border-gray-200">
                <CardHeader>
                  <CardTitle>Ingresos por Método de Pago</CardTitle>
                  <CardDescription>Distribución de tus ingresos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.keys(stats.ingresosPorMetodo).length > 0 ? (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">Efectivo</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900">
                            {formatPrice(stats.ingresosPorMetodo.efectivo || 0)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${((stats.ingresosPorMetodo.efectivo || 0) / stats.totalIngresos) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">Transferencia</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900">
                            {formatPrice(stats.ingresosPorMetodo.transferencia || 0)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{
                              width: `${((stats.ingresosPorMetodo.transferencia || 0) / stats.totalIngresos) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 py-4 text-center">No hay ingresos en este mes</p>
                  )}
                </CardContent>
              </Card>

              {/* Gastos por Categoría */}
              <Card className="rounded-xl border-gray-200">
                <CardHeader>
                  <CardTitle>Gastos por Categoría</CardTitle>
                  <CardDescription>Distribución de tus gastos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.keys(stats.gastosPorCategoria).length > 0 ? (
                    Object.entries(stats.gastosPorCategoria)
                      .sort(([, a]: any, [, b]: any) => b - a)
                      .map(([categoria, monto]: any, idx) => (
                        <div key={categoria} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: `hsl(${(idx * 360) / Object.keys(stats.gastosPorCategoria).length}, 70%, 50%)`,
                                }}
                              ></div>
                              <span className="text-sm font-medium text-gray-700">{categoria}</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                              {formatPrice(monto)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${(monto / stats.totalGastos) * 100}%`,
                                backgroundColor: `hsl(${(idx * 360) / Object.keys(stats.gastosPorCategoria).length}, 70%, 50%)`,
                              }}
                            ></div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-gray-500 py-4 text-center">No hay gastos en este mes</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Exportar Servicios */}
            <Card className="rounded-xl border-gray-200">
              <CardHeader>
                <CardTitle>Exportar Servicios a CSV</CardTitle>
                <CardDescription>
                  Descarga un archivo CSV con todos los servicios de un mes específico
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3 items-end">
                  <div className="flex-1 max-w-xs">
                    <Label htmlFor="month">Mes a exportar</Label>
                    <Input
                      id="month"
                      type="month"
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <Button onClick={handleExport} disabled={!month}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Exportar CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No hay datos para este mes
          </div>
        )}
      </div>
    </div>
  )
}
