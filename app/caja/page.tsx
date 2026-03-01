"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Plus, ArrowUpCircle, ArrowDownCircle, Wallet, CreditCard,
  ChevronLeft, ChevronRight, Calendar, Filter, X, Search
} from "lucide-react"
import {
  format, addDays, subDays, startOfWeek, endOfWeek,
  startOfMonth, endOfMonth, parseISO
} from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  getCashMovements,
  createCashMovement,
  deleteCashMovement,
  getDailyCloseByDate,
  type CashMovement,
  type CreateCashMovementDTO,
} from "@/lib/api/cash"
import { formatPrice, getTodayString } from "@/lib/utils"

type RangeType = "day" | "week" | "month" | "custom"

export default function CajaPage() {
  // State para UI
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<CreateCashMovementDTO>>({
    type: "INGRESO",
    method: "EFECTIVO",
  })

  // State para rango de fechas
  const [rangeType, setRangeType] = useState<RangeType>("day")
  const [selectedDate, setSelectedDate] = useState(getTodayString())
  const [customStart, setCustomStart] = useState(getTodayString())
  const [customEnd, setCustomEnd] = useState(getTodayString())

  // State para filtros
  const [filters, setFilters] = useState({
    type: "",
    method: "",
    category: "",
    search: "",
  })
  const [showFilters, setShowFilters] = useState(false)

  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Calcular rango de fechas según tipo
  const dateRange = useMemo(() => {
    const date = parseISO(selectedDate)

    switch (rangeType) {
      case "day":
        return { start: selectedDate, end: selectedDate }
      case "week":
        return {
          start: format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd"),
          end: format(endOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd"),
        }
      case "month":
        return {
          start: format(startOfMonth(date), "yyyy-MM-dd"),
          end: format(endOfMonth(date), "yyyy-MM-dd"),
        }
      case "custom":
        return { start: customStart, end: customEnd }
      default:
        return { start: selectedDate, end: selectedDate }
    }
  }, [rangeType, selectedDate, customStart, customEnd])

  // Obtener movimientos del rango
  const { data: movements, isLoading } = useQuery({
    queryKey: ["cash-movements", dateRange.start, dateRange.end],
    queryFn: () =>
      getCashMovements({
        startDate: new Date(dateRange.start + "T00:00:00").toISOString(),
        endDate: new Date(dateRange.end + "T23:59:59").toISOString(),
      }),
  })

  // Verificar si el día está cerrado (solo para vista de día)
  const { data: dailyClose } = useQuery({
    queryKey: ["daily-close", selectedDate],
    queryFn: () => getDailyCloseByDate(selectedDate),
    enabled: rangeType === "day",
  })

  const isDayClosed = dailyClose?.status === "CLOSED"

  // Obtener cuentas de transferencia
  const { data: transferAccounts } = useQuery({
    queryKey: ["transfer-accounts"],
    queryFn: async () => {
      const res = await fetch("/api/transfer-accounts")
      if (!res.ok) throw new Error("Error al obtener cuentas")
      return res.json()
    },
  })

  // Obtener categorías según el tipo de movimiento
  const { data: categories } = useQuery({
    queryKey: ["categories", formData.type],
    queryFn: async () => {
      const res = await fetch(`/api/categories?type=${formData.type}`)
      if (!res.ok) throw new Error("Error al obtener categorías")
      return res.json()
    },
    enabled: !!formData.type,
  })

  // Filtrar movimientos
  const filteredMovements = useMemo(() => {
    if (!movements) return []

    return movements.filter((m: CashMovement) => {
      if (filters.type && m.type !== filters.type) return false
      if (filters.method && m.method !== filters.method) return false
      if (filters.category && m.category !== filters.category) return false
      if (filters.search) {
        const search = filters.search.toLowerCase()
        const matchesDescription = m.description?.toLowerCase().includes(search)
        const matchesCategory = m.category?.toLowerCase().includes(search)
        const matchesAmount = m.amount.toString().includes(search)
        if (!matchesDescription && !matchesCategory && !matchesAmount) return false
      }
      return true
    })
  }, [movements, filters])

  // Calcular totales
  const totales = useMemo(() => {
    if (!filteredMovements) return null

    return filteredMovements.reduce(
      (acc, m) => {
        if (m.type === "INGRESO") {
          acc.ingresos += m.amount
          if (m.method === "EFECTIVO") acc.efectivo += m.amount
          else if (m.method === "TRANSFERENCIA") acc.transferencias += m.amount
          else if (m.method === "TARJETA") acc.tarjeta += m.amount
          else if (m.method === "OTRO") acc.otro += m.amount
        } else {
          acc.gastos += m.amount
        }
        return acc
      },
      { ingresos: 0, gastos: 0, efectivo: 0, transferencias: 0, tarjeta: 0, otro: 0 }
    )
  }, [filteredMovements])

  // Mutation para crear movimiento
  const createMutation = useMutation({
    mutationFn: createCashMovement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-movements"] })
      setIsFormOpen(false)
      setFormData({ type: "INGRESO", method: "EFECTIVO" })
      toast({
        title: "Movimiento creado",
        description: "El movimiento ha sido registrado exitosamente",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el movimiento",
        variant: "destructive",
      })
    },
  })

  // Mutation para eliminar movimiento
  const deleteMutation = useMutation({
    mutationFn: deleteCashMovement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-movements"] })
      toast({
        title: "Movimiento eliminado",
        description: "El movimiento ha sido eliminado",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el movimiento",
        variant: "destructive",
      })
    },
  })

  // Navegación de fechas
  const navigateDate = (direction: "prev" | "next" | "today") => {
    const date = parseISO(selectedDate)

    if (direction === "today") {
      setSelectedDate(getTodayString())
      return
    }

    const days = direction === "next" ? 1 : -1
    const newDate = direction === "next" ? addDays(date, days) : subDays(date, Math.abs(days))

    if (rangeType === "week") {
      setSelectedDate(format(direction === "next" ? addDays(date, 7) : subDays(date, 7), "yyyy-MM-dd"))
    } else if (rangeType === "month") {
      const newMonth = new Date(date)
      newMonth.setMonth(newMonth.getMonth() + (direction === "next" ? 1 : -1))
      setSelectedDate(format(newMonth, "yyyy-MM-dd"))
    } else {
      setSelectedDate(format(newDate, "yyyy-MM-dd"))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount || formData.amount <= 0) {
      toast({
        title: "Error",
        description: "El monto debe ser mayor a 0",
        variant: "destructive",
      })
      return
    }
    if (formData.method === "TRANSFERENCIA" && !formData.transferAccountId) {
      toast({
        title: "Error",
        description: "Debes seleccionar una cuenta de transferencia",
        variant: "destructive",
      })
      return
    }

    const dataToSubmit = {
      ...formData,
      date: formData.date || new Date().toISOString(),
    }

    createMutation.mutate(dataToSubmit as CreateCashMovementDTO)
  }

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({ type: "", method: "", category: "", search: "" })
  }

  const hasActiveFilters = Object.values(filters).some((v) => v !== "")

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Caja</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Gestiona tus movimientos de caja
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1">
                  {Object.values(filters).filter((v) => v !== "").length}
                </Badge>
              )}
            </Button>
            <Button
              onClick={() => setIsFormOpen(true)}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
              disabled={isDayClosed && rangeType === "day"}
            >
              <Plus className="h-4 w-4" />
              Nuevo Movimiento
            </Button>
          </div>
        </div>

        {/* Alerta día cerrado */}
        {isDayClosed && rangeType === "day" && (
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <p className="text-sm text-yellow-800">
              ⚠️ Este día está cerrado. No se pueden crear, editar o eliminar movimientos.
              Solo se permiten ajustes contables.
            </p>
          </Card>
        )}

        {/* Selector de rango */}
        <Card className="p-4">
          <div className="flex flex-col gap-4">
            {/* Tipo de rango */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={rangeType === "day" ? "default" : "outline"}
                onClick={() => setRangeType("day")}
              >
                Día
              </Button>
              <Button
                size="sm"
                variant={rangeType === "week" ? "default" : "outline"}
                onClick={() => setRangeType("week")}
              >
                Semana
              </Button>
              <Button
                size="sm"
                variant={rangeType === "month" ? "default" : "outline"}
                onClick={() => setRangeType("month")}
              >
                Mes
              </Button>
              <Button
                size="sm"
                variant={rangeType === "custom" ? "default" : "outline"}
                onClick={() => setRangeType("custom")}
              >
                Personalizado
              </Button>
            </div>

            {/* Navegación de fecha */}
            {rangeType !== "custom" ? (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigateDate("prev")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1 text-center">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="text-center"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {rangeType === "week" && `Semana del ${format(parseISO(dateRange.start), "dd MMM", { locale: es })} al ${format(parseISO(dateRange.end), "dd MMM", { locale: es })}`}
                    {rangeType === "month" && format(parseISO(selectedDate), "MMMM yyyy", { locale: es })}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigateDate("next")}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigateDate("today")}
                >
                  Hoy
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customStart">Desde</Label>
                  <Input
                    id="customStart"
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="customEnd">Hasta</Label>
                  <Input
                    id="customEnd"
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Panel de filtros */}
        {showFilters && (
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Filtros</h3>
                {hasActiveFilters && (
                  <Button size="sm" variant="ghost" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Limpiar
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Tipo</Label>
                  <Select
                    value={filters.type}
                    onValueChange={(value) => setFilters({ ...filters, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="INGRESO">Ingreso</SelectItem>
                      <SelectItem value="GASTO">Gasto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Método</Label>
                  <Select
                    value={filters.method}
                    onValueChange={(value) => setFilters({ ...filters, method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                      <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                      <SelectItem value="TARJETA">Tarjeta</SelectItem>
                      <SelectItem value="OTRO">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Categoría</Label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) => setFilters({ ...filters, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas</SelectItem>
                      {/* Aquí podrías cargar categorías dinámicamente */}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Descripción, monto..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Resumen de totales */}
        {totales && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-4 rounded-xl border-gray-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <ArrowUpCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Ingresos</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {formatPrice(totales.ingresos)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 rounded-xl border-gray-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
                  <ArrowDownCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Gastos</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {formatPrice(totales.gastos)}
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
                  <p className={`text-xl font-semibold ${totales.ingresos - totales.gastos >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatPrice(totales.ingresos - totales.gastos)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 rounded-xl border-gray-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Efectivo</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {formatPrice(totales.efectivo)}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Lista de movimientos */}
        <Card className="rounded-xl border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Movimientos
              {filteredMovements && ` (${filteredMovements.length})`}
            </h2>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-gray-500 text-sm">
              Cargando movimientos...
            </div>
          ) : filteredMovements && filteredMovements.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredMovements.map((movement: CashMovement) => (
                <div
                  key={movement.id}
                  className="p-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                            movement.type === "INGRESO"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {movement.type}
                        </Badge>
                        {movement.isAdjustment && (
                          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                            Ajuste
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {format(new Date(movement.date), "dd/MM/yyyy HH:mm")}
                        </span>
                      </div>
                      {movement.category && (
                        <p className="text-sm font-medium text-gray-900">
                          {movement.category}
                        </p>
                      )}
                      {movement.description && (
                        <p className="text-sm text-gray-600 mt-0.5">
                          {movement.description}
                        </p>
                      )}
                      {movement.adjustmentReason && (
                        <p className="text-xs text-orange-600 mt-1">
                          Razón: {movement.adjustmentReason}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {movement.method}
                        {movement.method === "TRANSFERENCIA" && movement.transferAccountId && transferAccounts && ` - ${transferAccounts.find((acc: any) => acc.id === movement.transferAccountId)?.name || ""}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-semibold ${
                          movement.type === "INGRESO"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {movement.type === "INGRESO" ? "+" : "-"}
                        {formatPrice(movement.amount)}
                      </p>
                      {!movement.isAdjustment && !isDayClosed && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(movement.id)}
                          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 mt-1 h-7"
                        >
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-sm text-gray-500">
                No hay movimientos para este rango
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Dialog para crear movimiento */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nuevo Movimiento</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INGRESO">Ingreso</SelectItem>
                    <SelectItem value="GASTO">Gasto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="method">Método de Pago</Label>
                <Select
                  value={formData.method}
                  onValueChange={(value: any) => {
                    setFormData({
                      ...formData,
                      method: value,
                      transferAccountId: value === "TRANSFERENCIA" ? formData.transferAccountId : undefined,
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                    <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                    <SelectItem value="TARJETA">Tarjeta</SelectItem>
                    <SelectItem value="OTRO">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Selector de cuenta de transferencia */}
            {formData.method === "TRANSFERENCIA" && transferAccounts && (
              <div>
                <Label htmlFor="transferAccount">Cuenta de Transferencia</Label>
                <Select
                  value={formData.transferAccountId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, transferAccountId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una cuenta" />
                  </SelectTrigger>
                  <SelectContent>
                    {transferAccounts
                      .filter((acc: any) => acc.isActive)
                      .map((acc: any) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="amount">Monto</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0"
                value={formData.amount || ""}
                onChange={(e) =>
                  setFormData({ ...formData, amount: parseFloat(e.target.value) })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={formData.category || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories && categories.length > 0 ? (
                    categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500 text-center">
                      No hay categorías. Ve a Configuración para crear algunas.
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Input
                id="description"
                placeholder="Detalles adicionales"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
