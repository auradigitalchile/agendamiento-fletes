"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, ArrowUpCircle, ArrowDownCircle, Wallet, CreditCard } from "lucide-react"
import { format, startOfDay, endOfDay } from "date-fns"
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
  type CashMovement,
  type CreateCashMovementDTO,
} from "@/lib/api/cash"
import { formatPrice } from "@/lib/utils"

export default function CajaPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<CreateCashMovementDTO>>({
    type: "INGRESO",
    method: "EFECTIVO",
  })
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Obtener movimientos del día actual
  const today = new Date()
  const { data: movements, isLoading } = useQuery({
    queryKey: ["cash-movements", format(today, "yyyy-MM-dd")],
    queryFn: () =>
      getCashMovements({
        startDate: format(startOfDay(today), "yyyy-MM-dd"),
        endDate: format(endOfDay(today), "yyyy-MM-dd"),
      }),
  })

  // Obtener cuentas de transferencia
  const { data: transferAccounts } = useQuery({
    queryKey: ["transfer-accounts"],
    queryFn: async () => {
      const res = await fetch("/api/transfer-accounts")
      if (!res.ok) throw new Error("Error al obtener cuentas")
      return res.json()
    },
  })

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
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el movimiento",
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
  })

  // Calcular totales del día
  const totales = movements
    ? movements.reduce(
        (acc, m) => {
          if (m.type === "INGRESO") {
            acc.ingresos += m.amount
            if (m.method === "EFECTIVO") {
              acc.efectivo += m.amount
            } else if (m.method === "TRANSFERENCIA") {
              acc.transferencias += m.amount
            }
          } else {
            acc.gastos += m.amount
          }
          return acc
        },
        {
          ingresos: 0,
          gastos: 0,
          efectivo: 0,
          transferencias: 0,
        }
      )
    : null

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
    createMutation.mutate(formData as CreateCashMovementDTO)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Caja</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Gestiona tus movimientos diarios de caja
            </p>
          </div>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="gap-2 h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Nuevo Movimiento
          </Button>
        </div>

        {/* Resumen del día */}
        {totales && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-4 rounded-xl border-gray-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <ArrowUpCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Ingresos Hoy</p>
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
                  <p className="text-sm font-medium text-gray-600">Gastos Hoy</p>
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
                  <p className="text-sm font-medium text-gray-600">Efectivo</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {formatPrice(totales.efectivo)}
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
                  <p className="text-sm font-medium text-gray-600">Transferencias</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {formatPrice(totales.transferencias)}
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
              Movimientos del día
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {format(today, "dd 'de' MMMM, yyyy")}
            </p>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-gray-500 text-sm">
              Cargando movimientos...
            </div>
          ) : movements && movements.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {movements.map((movement) => (
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
                        <span className="text-xs text-gray-500">
                          {format(new Date(movement.date), "HH:mm")}
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
                      <p className="text-xs text-gray-500 mt-1">
                        {movement.method === "TRANSFERENCIA" && movement.transferAccountId
                          ? transferAccounts?.find((acc: any) => acc.id === movement.transferAccountId)?.name || "Transferencia"
                          : movement.method === "EFECTIVO"
                          ? "Efectivo"
                          : "Transferencia"}
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(movement.id)}
                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 mt-1 h-7"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-sm text-gray-500">
                No hay movimientos registrados para hoy
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
                      transferAccountId: value === "TRANSFERENCIA" ? undefined : undefined,
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                    <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
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
              <Input
                id="category"
                placeholder="Ej: Servicio, Combustible, Mantención..."
                value={formData.category || ""}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              />
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
