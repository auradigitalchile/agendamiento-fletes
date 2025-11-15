"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format, startOfDay } from "date-fns"
import { Calendar as CalendarIcon, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  getCashMovements,
  createDailyClose,
  getDailyCloseByDate,
  type CreateDailyCloseDTO,
} from "@/lib/api/cash"
import { formatPrice } from "@/lib/utils"

export default function CierreDiarioPage() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [notes, setNotes] = useState("")
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Obtener movimientos del día seleccionado
  const { data: movements } = useQuery({
    queryKey: ["cash-movements", selectedDate],
    queryFn: () =>
      getCashMovements({
        startDate: selectedDate,
        endDate: selectedDate,
      }),
  })

  // Verificar si ya existe cierre para esta fecha
  const { data: existingClose } = useQuery({
    queryKey: ["daily-close", selectedDate],
    queryFn: () => getDailyCloseByDate(selectedDate),
  })

  // Mutation para crear cierre
  const createCloseMutation = useMutation({
    mutationFn: createDailyClose,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-close"] })
      toast({
        title: "Cierre creado",
        description: "El cierre diario ha sido registrado exitosamente",
      })
      setNotes("")
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el cierre",
        variant: "destructive",
      })
    },
  })

  // Calcular totales automáticamente
  const totales = movements
    ? movements.reduce(
        (acc, m) => {
          if (m.type === "INGRESO") {
            if (m.method === "EFECTIVO") acc.efectivo += m.amount
            if (m.method === "TRANSFERENCIA_ANDRES") acc.transferAndres += m.amount
            if (m.method === "TRANSFERENCIA_HERMANO") acc.transferHermano += m.amount
          } else {
            acc.gastos += m.amount
          }
          return acc
        },
        {
          efectivo: 0,
          transferAndres: 0,
          transferHermano: 0,
          gastos: 0,
        }
      )
    : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!totales) return

    const cierreData: CreateDailyCloseDTO = {
      date: new Date(selectedDate),
      totalCash: totales.efectivo,
      totalTransferAndres: totales.transferAndres,
      totalTransferHermano: totales.transferHermano,
      totalExpenses: totales.gastos,
      finalCash: totales.efectivo - totales.gastos,
      notes: notes || undefined,
    }

    createCloseMutation.mutate(cierreData)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Cierre Diario
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Registra el cierre de caja del día
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Selector de fecha y resumen */}
          <Card className="p-6 rounded-xl border-gray-200">
            <div className="space-y-4">
              <div>
                <Label htmlFor="date" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Seleccionar Fecha
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={format(new Date(), "yyyy-MM-dd")}
                  className="mt-2"
                />
              </div>

              {existingClose ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                    <p className="font-medium">Cierre ya registrado</p>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    Esta fecha ya tiene un cierre registrado
                  </p>
                </div>
              ) : (
                totales && (
                  <div className="space-y-3 pt-2">
                    <h3 className="font-semibold text-gray-900">Resumen del Día</h3>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">
                          Efectivo
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatPrice(totales.efectivo)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">
                          Transfer. Andrés
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatPrice(totales.transferAndres)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">
                          Transfer. Hermano
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatPrice(totales.transferHermano)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                        <span className="text-sm font-medium text-red-600">
                          Gastos
                        </span>
                        <span className="text-sm font-semibold text-red-600">
                          {formatPrice(totales.gastos)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <span className="text-sm font-medium text-blue-600">
                          Efectivo Final
                        </span>
                        <span className="text-lg font-bold text-blue-600">
                          {formatPrice(totales.efectivo - totales.gastos)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-semibold text-gray-900">
                          Total Ingresos
                        </span>
                        <span className="text-xl font-bold text-green-600">
                          {formatPrice(
                            totales.efectivo +
                              totales.transferAndres +
                              totales.transferHermano
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </Card>

          {/* Formulario de cierre */}
          {!existingClose && totales && (
            <Card className="p-6 rounded-xl border-gray-200">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Confirmar Cierre
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="notes">Notas (opcional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Observaciones del día..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                        className="mt-2"
                      />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-700">
                        <strong>Importante:</strong> Una vez creado el cierre, no podrás
                        modificarlo. Asegúrate de que todos los movimientos del día
                        estén registrados.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={createCloseMutation.isPending}
                    >
                      {createCloseMutation.isPending
                        ? "Guardando..."
                        : "Confirmar Cierre"}
                    </Button>
                  </div>
                </div>
              </form>
            </Card>
          )}
        </div>

        {/* Lista de movimientos del día */}
        {movements && movements.length > 0 && (
          <Card className="rounded-xl border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">
                Movimientos del día ({movements.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {movements.map((m) => (
                <div key={m.id} className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {m.category || "Sin categoría"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {m.method.replace("_", " ")} • {format(new Date(m.date), "HH:mm")}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-semibold ${
                      m.type === "INGRESO" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {m.type === "INGRESO" ? "+" : "-"}
                    {formatPrice(m.amount)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
