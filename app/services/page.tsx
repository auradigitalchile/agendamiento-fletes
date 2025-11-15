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
      PENDIENTE: "bg-orange-500 text-white hover:bg-orange-600",
      CONFIRMADO: "bg-blue-500 text-white hover:bg-blue-600",
      FINALIZADO: "bg-green-500 text-white hover:bg-green-600",
      CANCELADO: "bg-red-500 text-white hover:bg-red-600",
    }
    return colors[status] || "bg-gray-500 text-white"
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      FLETE: "bg-blue-500 text-white hover:bg-blue-600",
      MUDANZA: "bg-purple-500 text-white hover:bg-purple-600",
      ESCOMBROS: "bg-green-600 text-white hover:bg-green-700",
    }
    return colors[type] || "bg-gray-500 text-white"
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header con título y botones */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Servicios</h1>
          <div className="flex gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={handleExport}
              className="gap-2 text-sm sm:text-base h-10 sm:h-10"
            >
              <FileDown className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar CSV</span>
              <span className="sm:hidden">Exportar</span>
            </Button>
            <Button
              onClick={handleNewService}
              className="gap-2 text-sm sm:text-base h-10 sm:h-10"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nuevo Servicio</span>
              <span className="sm:hidden">Nuevo</span>
            </Button>
          </div>
        </div>

        {/* Tabla de servicios */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Cargando servicios...
          </div>
        ) : services && services.length > 0 ? (
          <div className="bg-card rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 sm:p-4 font-medium text-muted-foreground text-sm whitespace-nowrap">
                      Fecha
                    </th>
                    <th className="text-left p-3 sm:p-4 font-medium text-muted-foreground text-sm whitespace-nowrap">
                      Cliente
                    </th>
                    <th className="text-left p-3 sm:p-4 font-medium text-muted-foreground text-sm whitespace-nowrap">
                      Tipo
                    </th>
                    <th className="text-left p-3 sm:p-4 font-medium text-muted-foreground text-sm whitespace-nowrap">
                      Precio
                    </th>
                    <th className="text-left p-3 sm:p-4 font-medium text-muted-foreground text-sm whitespace-nowrap">
                      Estado
                    </th>
                    <th className="text-left p-3 sm:p-4 font-medium text-muted-foreground text-sm whitespace-nowrap">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-3 sm:p-4 text-muted-foreground text-sm whitespace-nowrap">
                        {format(new Date(service.scheduledDate), "dd/MM/yyyy HH:mm")}
                      </td>
                      <td className="p-3 sm:p-4 font-medium text-sm">
                        {service.clientName}
                      </td>
                      <td className="p-3 sm:p-4">
                        <Badge className={getTypeColor(service.type)}>
                          {getServiceTypeLabel(service.type)}
                        </Badge>
                      </td>
                      <td className="p-3 sm:p-4 font-semibold text-sm">
                        {formatPrice(service.price)}
                      </td>
                      <td className="p-3 sm:p-4">
                        <Badge className={getStatusColor(service.status)}>
                          {getServiceStatusLabel(service.status)}
                        </Badge>
                      </td>
                      <td className="p-3 sm:p-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(service)}
                          className="h-10 w-10 sm:h-8 sm:w-8"
                        >
                          <Pencil className="h-5 w-5 sm:h-4 sm:w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-lg border p-12 text-center">
            <p className="text-muted-foreground">
              No hay servicios registrados
            </p>
          </div>
        )}
      </div>

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
