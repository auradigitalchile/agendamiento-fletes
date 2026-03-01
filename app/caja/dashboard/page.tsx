"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  parseISO,
} from "date-fns"
import { es } from "date-fns/locale"
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Calendar,
  DollarSign,
  Percent,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { getKPIs, getCapital } from "@/lib/api/cash"
import { formatPrice } from "@/lib/utils"
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"]

type PeriodType = "month" | "year" | "all"

export default function DashboardPage() {
  const [periodType, setPeriodType] = useState<PeriodType>("month")
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"))
  const [selectedYear, setSelectedYear] = useState(format(new Date(), "yyyy"))

  // Calcular rango de fechas según período
  const dateRange = useMemo(() => {
    if (periodType === "month") {
      const monthDate = new Date(selectedMonth + "-01")
      return {
        start: format(startOfMonth(monthDate), "yyyy-MM-dd"),
        end: format(endOfMonth(monthDate), "yyyy-MM-dd"),
      }
    } else if (periodType === "year") {
      const yearDate = new Date(`${selectedYear}-01-01`)
      return {
        start: format(startOfYear(yearDate), "yyyy-MM-dd"),
        end: format(endOfYear(yearDate), "yyyy-MM-dd"),
      }
    } else {
      // "all" - desde inicio de contabilidad hasta hoy
      return {
        start: "2020-01-01",
        end: format(new Date(), "yyyy-MM-dd"),
      }
    }
  }, [periodType, selectedMonth, selectedYear])

  // Obtener KPIs del período
  const { data: kpis, isLoading: isLoadingKPIs } = useQuery({
    queryKey: ["kpis", dateRange.start, dateRange.end],
    queryFn: () =>
      getKPIs({
        startDate: dateRange.start,
        endDate: dateRange.end,
      }),
  })

  // Obtener capital acumulado histórico
  const { data: capital, isLoading: isLoadingCapital } = useQuery({
    queryKey: ["capital", dateRange.end],
    queryFn: () =>
      getCapital({
        endDate: dateRange.end,
      }),
  })

  const isLoading = isLoadingKPIs || isLoadingCapital

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Cargando dashboard...</p>
      </div>
    )
  }

  if (!kpis || !capital) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    )
  }

  // Preparar datos para gráfico de distribución de métodos de pago
  const distribucionData = [
    { name: "Efectivo", value: kpis.totalIngresos * 0.4 }, // Esto debería venir del backend
    { name: "Transferencia", value: kpis.totalIngresos * 0.6 },
  ].filter((item) => item.value > 0)

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Dashboard Financiero
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Análisis financiero y KPIs
          </p>
        </div>

        {/* Selector de período */}
        <Card className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <Label className="text-sm font-medium text-gray-700">
                Seleccionar Período
              </Label>
            </div>

            {/* Tipo de período */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={periodType === "month" ? "default" : "outline"}
                onClick={() => setPeriodType("month")}
              >
                Por Mes
              </Button>
              <Button
                size="sm"
                variant={periodType === "year" ? "default" : "outline"}
                onClick={() => setPeriodType("year")}
              >
                Por Año
              </Button>
              <Button
                size="sm"
                variant={periodType === "all" ? "default" : "outline"}
                onClick={() => setPeriodType("all")}
              >
                Todo el Histórico
              </Button>
            </div>

            {/* Selector específico */}
            {periodType === "month" && (
              <div className="max-w-xs">
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {format(parseISO(selectedMonth + "-01"), "MMMM yyyy", { locale: es })}
                </p>
              </div>
            )}

            {periodType === "year" && (
              <div className="max-w-xs">
                <Input
                  type="number"
                  min="2020"
                  max={new Date().getFullYear()}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                />
              </div>
            )}

            {periodType === "all" && (
              <p className="text-sm text-gray-600">
                Mostrando datos desde el inicio de la contabilidad ({format(parseISO(capital.startDate as string), "dd/MM/yyyy")}) hasta {format(parseISO(dateRange.end), "dd/MM/yyyy")}
              </p>
            )}
          </div>
        </Card>

        {/* KPIs principales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Ingresos */}
          <Card className="p-4 rounded-xl border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Ingresos Totales
                </p>
                <p className="text-xl font-semibold text-gray-900">
                  {formatPrice(kpis.totalIngresos)}
                </p>
              </div>
            </div>
          </Card>

          {/* Gastos */}
          <Card className="p-4 rounded-xl border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Gastos Totales
                </p>
                <p className="text-xl font-semibold text-gray-900">
                  {formatPrice(kpis.totalGastos)}
                </p>
              </div>
            </div>
          </Card>

          {/* Balance del período */}
          <Card className="p-4 rounded-xl border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Balance Período</p>
                <p
                  className={`text-xl font-semibold ${
                    kpis.balance >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatPrice(kpis.balance)}
                </p>
              </div>
            </div>
          </Card>

          {/* Capital Acumulado Histórico */}
          <Card className="p-4 rounded-xl border-gray-200 bg-gradient-to-br from-purple-50 to-blue-50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <PiggyBank className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Capital Acumulado
                </p>
                <p
                  className={`text-xl font-semibold ${
                    capital.capitalAcumulado >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatPrice(capital.capitalAcumulado)}
                </p>
                <p className="text-xs text-gray-500">Histórico total</p>
              </div>
            </div>
          </Card>
        </div>

        {/* KPIs secundarios */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Margen Promedio */}
          <Card className="p-4 rounded-xl border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <Percent className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Margen Promedio
                </p>
                <p className="text-xl font-semibold text-gray-900">
                  {kpis.margenPromedio.toFixed(1)}%
                </p>
              </div>
            </div>
          </Card>

          {/* Ingreso por Servicio */}
          <Card className="p-4 rounded-xl border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-cyan-50 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Ingreso por Servicio
                </p>
                <p className="text-xl font-semibold text-gray-900">
                  {formatPrice(kpis.ingresoPorServicio)}
                </p>
              </div>
            </div>
          </Card>

          {/* Cantidad de Servicios */}
          <Card className="p-4 rounded-xl border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Servicios Completados
                </p>
                <p className="text-xl font-semibold text-gray-900">
                  {kpis.cantidadServicios}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Gráfico de Ganancia Diaria */}
          <Card className="p-6 rounded-xl border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">
              Ganancia Diaria
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={kpis.gananciaDiaria}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="fecha"
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) => format(parseISO(value), "dd/MM")}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                <Tooltip
                  formatter={(value: number) => formatPrice(value)}
                  labelFormatter={(label) =>
                    format(parseISO(label as string), "dd MMMM yyyy", { locale: es })
                  }
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="ganancia"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Ganancia"
                />
                <Line
                  type="monotone"
                  dataKey="ingresos"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 3 }}
                  name="Ingresos"
                />
                <Line
                  type="monotone"
                  dataKey="gastos"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: "#ef4444", r: 3 }}
                  name="Gastos"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Gráfico de Ingresos por Tipo de Servicio */}
          {kpis.ingresosPorTipo.length > 0 && (
            <Card className="p-6 rounded-xl border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">
                Ingresos por Tipo de Servicio
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={kpis.ingresosPorTipo}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="tipo"
                    stroke="#6b7280"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                  <Tooltip
                    formatter={(value: number) => formatPrice(value)}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="total" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Total" />
                  <Bar dataKey="promedio" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Promedio" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Tabla resumen por tipo de servicio */}
          {kpis.ingresosPorTipo.length > 0 && (
            <Card className="p-6 rounded-xl border-gray-200 lg:col-span-2">
              <h3 className="font-semibold text-gray-900 mb-4">
                Resumen por Tipo de Servicio
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">
                        Tipo
                      </th>
                      <th className="text-right py-2 px-4 text-sm font-medium text-gray-600">
                        Cantidad
                      </th>
                      <th className="text-right py-2 px-4 text-sm font-medium text-gray-600">
                        Total Ingresos
                      </th>
                      <th className="text-right py-2 px-4 text-sm font-medium text-gray-600">
                        Promedio
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {kpis.ingresosPorTipo.map((tipo) => (
                      <tr key={tipo.tipo} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                          {tipo.tipo}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-gray-600">
                          {tipo.cantidad}
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-semibold text-green-600">
                          {formatPrice(tipo.total)}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-gray-900">
                          {formatPrice(tipo.promedio)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-semibold">
                      <td className="py-3 px-4 text-sm text-gray-900">
                        TOTAL
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-900">
                        {kpis.cantidadServicios}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-green-600">
                        {formatPrice(kpis.totalIngresos)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-900">
                        {formatPrice(kpis.ingresoPorServicio)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        {/* Información del capital acumulado */}
        <Card className="p-6 rounded-xl border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
              <PiggyBank className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                Capital Acumulado Histórico
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Desde {format(parseISO(capital.startDate as string), "dd MMMM yyyy", { locale: es })} hasta{" "}
                {format(parseISO(capital.endDate as string), "dd MMMM yyyy", { locale: es })}
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Ingresos</p>
                  <p className="text-lg font-semibold text-green-600">
                    {formatPrice(capital.totalIngresos)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Gastos</p>
                  <p className="text-lg font-semibold text-red-600">
                    {formatPrice(capital.totalGastos)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Capital Acumulado</p>
                  <p
                    className={`text-2xl font-bold ${
                      capital.capitalAcumulado >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatPrice(capital.capitalAcumulado)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
