"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ServiceCalendar } from "@/components/calendar/service-calendar"
import { ServiceForm } from "@/components/services/service-form"
import { useToast } from "@/components/ui/use-toast"
import {
  getServices,
  createService,
  updateService,
  deleteService,
  Service,
  CreateServiceDTO,
} from "@/lib/api/services"

export default function HomePage() {
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedService, setSelectedService] = useState<Service | undefined>()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Query para obtener servicios con filtros
  const { data: services, isLoading } = useQuery({
    queryKey: ["services", typeFilter],
    queryFn: () =>
      getServices(typeFilter !== "all" ? { type: typeFilter } : undefined),
  })

  // Mutation para crear servicio
  const createMutation = useMutation({
    mutationFn: createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] })
      setIsFormOpen(false)
      setSelectedDate(undefined)
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

  // Mutation para eliminar servicio
  const deleteMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] })
      toast({
        title: "Servicio eliminado",
        description: "El servicio ha sido eliminado exitosamente",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el servicio",
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

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setSelectedService(undefined)
    setIsFormOpen(true)
  }

  const handleEventClick = (service: Service) => {
    setSelectedService(service)
    setSelectedDate(undefined)
    setIsFormOpen(true)
  }

  const handleNewService = () => {
    setSelectedService(undefined)
    setSelectedDate(undefined)
    setIsFormOpen(true)
  }

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Calendario"
        description="Vista general de servicios agendados"
      />

      <div className="flex-1 space-y-4 p-6">
        {/* Barra de acciones */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="FLETE">Flete</SelectItem>
                <SelectItem value="MUDANZA">Mudanza</SelectItem>
                <SelectItem value="ESCOMBROS">Escombros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleNewService}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Servicio
          </Button>
        </div>

        {/* Calendario */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Cargando calendario...
          </div>
        ) : services ? (
          <ServiceCalendar
            services={services}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
          />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No hay servicios registrados
          </div>
        )}
      </div>

      {/* Formulario de servicio */}
      <ServiceForm
        service={selectedService}
        initialDate={selectedDate}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
