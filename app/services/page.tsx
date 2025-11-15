"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, FileDown, Pencil } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ServiceForm } from "@/components/services/service-form"
import { useToast } from "@/components/ui/use-toast"
import {
  getServices,
  createService,
  updateService,
  exportServices,
  Service,
  CreateServiceDTO,
} from "@/lib/api/services"
import {
  formatPrice,
  getServiceTypeLabel,
  getServiceStatusLabel,
} from "@/lib/utils"

export default function ServicesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | undefined>()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Query para obtener servicios
  const { data: services, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: () => getServices(),
  })

  // Mutation para crear servicio
  const createMutation = useMutation({
    mutationFn: createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] })
      setIsFormOpen(false)
      toast({
        title: "Servicio creado",
        description: "El servicio ha sido creado exitosamente",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el servicio",
        variant: "destructive",
      })
    },
  })

  // Mutation para actualizar servicio
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateServiceDTO }) =>
      updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] })
      setIsFormOpen(false)
      setSelectedService(undefined)
      toast({
        title: "Servicio actualizado",
        description: "El servicio ha sido actualizado exitosamente",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el servicio",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = async (data: CreateServiceDTO) => {
    if (selectedService) {
      await updateMutation.mutateAsync({ id: selectedService.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  const handleEdit = (service: Service) => {
    setSelectedService(service)
    setIsFormOpen(true)
  }

  const handleNewService = () => {
    setSelectedService(undefined)
    setIsFormOpen(true)
  }

  const handleExport = async () => {
    const month = format(new Date(), "yyyy-MM")
    await exportServices(month)
    toast({
      title: "Exportación exitosa",
      description: `Servicios del mes ${month} exportados`,
    })
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDIENTE: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
      CONFIRMADO: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
      FINALIZADO: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
      CANCELADO: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
    }
    return colors[status] || "bg-gray-50 text-gray-700 border-gray-200"
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      FLETE: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
      MUDANZA: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
      ESCOMBROS: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
    }
    return colors[type] || "bg-gray-50 text-gray-700 border-gray-200"
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header con título y botones */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Servicios</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Gestiona tus servicios de flete, mudanza y escombros
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExport}
              className="gap-2 text-sm h-9 px-3 rounded-lg border-gray-300 hover:bg-gray-50 hidden sm:flex"
            >
              <FileDown className="h-4 w-4" />
              Exportar
            </Button>
            <Button
              onClick={handleNewService}
              className="gap-2 text-sm h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 shadow-sm hidden md:flex"
            >
              <Plus className="h-4 w-4" />
              Nuevo Servicio
            </Button>
          </div>
        </div>

        {/* Tabla de servicios - Desktop */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Cargando servicios...
          </div>
        ) : services && services.length > 0 ? (
          <>
            {/* Vista Desktop - Tabla compacta */}
            <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left px-4 py-2.5 font-medium text-gray-600 text-xs uppercase tracking-wide">
                        Fecha
                      </th>
                      <th className="text-left px-4 py-2.5 font-medium text-gray-600 text-xs uppercase tracking-wide">
                        Cliente
                      </th>
                      <th className="text-left px-4 py-2.5 font-medium text-gray-600 text-xs uppercase tracking-wide">
                        Tipo
                      </th>
                      <th className="text-left px-4 py-2.5 font-medium text-gray-600 text-xs uppercase tracking-wide">
                        Precio
                      </th>
                      <th className="text-left px-4 py-2.5 font-medium text-gray-600 text-xs uppercase tracking-wide">
                        Estado
                      </th>
                      <th className="text-right px-4 py-2.5 font-medium text-gray-600 text-xs uppercase tracking-wide">

                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {services.map((service) => (
                      <tr
                        key={service.id}
                        className="group hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-2.5">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                              {format(new Date(service.scheduledDate), "dd/MM/yyyy")}
                            </span>
                            <span className="text-xs text-gray-500">
                              {format(new Date(service.scheduledDate), "HH:mm")}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-sm font-medium text-gray-900">
                            {service.clientName}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge
                            variant="outline"
                            className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getTypeColor(service.type)}`}
                          >
                            {getServiceTypeLabel(service.type)}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatPrice(service.price)}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge
                            variant="outline"
                            className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getStatusColor(service.status)}`}
                          >
                            {getServiceStatusLabel(service.status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(service)}
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Vista Mobile - Cards */}
            <div className="md:hidden space-y-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-all"
                  onClick={() => handleEdit(service)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-500">
                          {format(new Date(service.scheduledDate), "dd/MM/yyyy")}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs font-medium text-gray-500">
                          {format(new Date(service.scheduledDate), "HH:mm")}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {service.clientName}
                      </h3>
                    </div>
                    <span className="text-base font-bold text-gray-900">
                      {formatPrice(service.price)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${getTypeColor(service.type)}`}
                    >
                      {getServiceTypeLabel(service.type)}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${getStatusColor(service.status)}`}
                    >
                      {getServiceStatusLabel(service.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-sm text-gray-500">
              No hay servicios registrados
            </p>
          </div>
        )}
      </div>

      {/* Botón flotante para móvil */}
      <button
        onClick={handleNewService}
        className="md:hidden fixed bottom-6 right-6 h-14 w-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-50"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Formulario de servicio */}
      <ServiceForm
        service={selectedService}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
