"use client"

import { useQuery } from "@tanstack/react-query"
import { format, subDays } from "date-fns"
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { getCashStats } from "@/lib/api/cash"
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

export default function DashboardPage() {
  // Obtener estadísticas del último mes
  const { data: stats, isLoading } = useQuery({
    queryKey: ["cash-stats"],
    queryFn: () =>
      getCashStats({
        startDate: format(subDays(new Date(), 30), "yyyy-MM-dd"),
        endDate: format(new Date(), "yyyy-MM-dd"),
      }),
  })

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Cargando dashboard...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    )
  }

  // Preparar datos para gráfico de distribución de métodos de pago
  const distribucionData = [
    { name: "Efectivo", value: stats.efectivo },
    { name: "Transfer. Andrés", value: stats.transferenciasAndres },
    { name: "Transfer. Leonardo", value: stats.transferenciasHermano },
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
            Resumen de los últimos 30 días
          </p>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                  {formatPrice(stats.totalIngresos)}
                </p>
              </div>
            </div>
          </Card>

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
                  {formatPrice(stats.totalGastos)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 rounded-xl border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Balance</p>
                <p
                  className={`text-xl font-semibold ${
                    stats.balance >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatPrice(stats.balance)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 rounded-xl border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <PiggyBank className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Capital Acumulado
                </p>
                <p className="text-xl font-semibold text-gray-900">
                  {formatPrice(stats.balance)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Gráfico de ingresos últimas 4 semanas */}
          <Card className="p-6 rounded-xl border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">
              Ingresos Últimas 4 Semanas
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.ingresosUltimas4Semanas}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="semana"
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
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Gráfico de distribución por método de pago */}
          <Card className="p-6 rounded-xl border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">
              Distribución de Ingresos
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distribucionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distribucionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatPrice(value)}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Gráfico de gastos por categoría */}
          {stats.gastosPorCategoria.length > 0 && (
            <Card className="p-6 rounded-xl border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">
                Gastos por Categoría
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.gastosPorCategoria}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="category"
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
                  <Bar dataKey="total" fill="#ef4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Gráfico de ingresos por categoría */}
          {stats.ingresosPorCategoria.length > 0 && (
            <Card className="p-6 rounded-xl border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">
                Ingresos por Categoría
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.ingresosPorCategoria}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="category"
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
                  <Bar dataKey="total" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
