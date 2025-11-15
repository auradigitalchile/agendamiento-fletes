"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Service, CreateServiceDTO } from "@/lib/api/services"

const serviceFormSchema = z.object({
  // Datos del cliente
  clientName: z.string().min(1, "El nombre del cliente es requerido"),
  clientPhone: z.string().min(1, "El teléfono es requerido"),
  clientAddress: z.string().optional(),

  // Datos del servicio
  type: z.enum(["FLETE", "MUDANZA", "ESCOMBROS"]),
  status: z.enum(["PENDIENTE", "CONFIRMADO", "FINALIZADO", "CANCELADO"]).default("PENDIENTE"),
  scheduledDate: z.string().min(1, "La fecha es requerida"),
  price: z.number().positive("El precio debe ser mayor a 0"),

  // Campos condicionales para FLETE/MUDANZA
  origin: z.string().optional(),
  destination: z.string().optional(),
  cargoDescription: z.string().optional(),
  requiresHelper: z.boolean().default(false),

  // Campos condicionales para ESCOMBROS
  debrisType: z.enum(["OBRA", "TIERRA", "MADERA", "ARIDOS", "MIXTO"]).optional(),
  debrisQuantity: z.enum(["PEQUENO", "MEDIO_CAMION", "LLENO"]).optional(),

  notes: z.string().optional(),
})

type ServiceFormValues = z.infer<typeof serviceFormSchema>

interface ServiceFormProps {
  service?: Service
  initialDate?: Date
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateServiceDTO) => Promise<void>
}

export function ServiceForm({
  service,
  initialDate,
  open,
  onOpenChange,
  onSubmit,
}: ServiceFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: service
      ? {
          clientName: service.clientName || "",
          clientPhone: service.clientPhone || "",
          clientAddress: service.clientAddress || "",
          type: service.type,
          status: service.status,
          scheduledDate: new Date(service.scheduledDate).toISOString().slice(0, 16),
          price: service.price || 0,
          origin: service.origin || "",
          destination: service.destination || "",
          cargoDescription: service.cargoDescription || "",
          requiresHelper: service.requiresHelper || false,
          debrisType: service.debrisType || undefined,
          debrisQuantity: service.debrisQuantity || undefined,
          notes: service.notes || "",
        }
      : {
          clientName: "",
          clientPhone: "",
          clientAddress: "",
          status: "PENDIENTE",
          requiresHelper: false,
          scheduledDate: initialDate
            ? new Date(initialDate).toISOString().slice(0, 16)
            : "",
          price: 0,
        },
  })

  // Efecto para actualizar el formulario cuando cambia el servicio a editar
  useEffect(() => {
    if (service) {
      reset({
        clientName: service.clientName || "",
        clientPhone: service.clientPhone || "",
        clientAddress: service.clientAddress || "",
        type: service.type,
        status: service.status,
        scheduledDate: new Date(service.scheduledDate).toISOString().slice(0, 16),
        price: service.price || 0,
        origin: service.origin || "",
        destination: service.destination || "",
        cargoDescription: service.cargoDescription || "",
        requiresHelper: service.requiresHelper || false,
        debrisType: service.debrisType || undefined,
        debrisQuantity: service.debrisQuantity || undefined,
        notes: service.notes || "",
      })
    }
  }, [service, reset])

  const serviceType = watch("type")

  const handleFormSubmit = async (data: ServiceFormValues) => {
    const payload: CreateServiceDTO = {
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      clientAddress: data.clientAddress,
      type: data.type,
      status: data.status,
      scheduledDate: data.scheduledDate,
      price: data.price,
      notes: data.notes,
      requiresHelper: data.requiresHelper,
    }

    if (data.type === "FLETE" || data.type === "MUDANZA") {
      payload.origin = data.origin
      payload.destination = data.destination
      payload.cargoDescription = data.cargoDescription
    } else if (data.type === "ESCOMBROS") {
      payload.origin = data.origin
      payload.debrisType = data.debrisType
      payload.debrisQuantity = data.debrisQuantity
    }

    await onSubmit(payload)
    reset()
  }

  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  const isFleteOrMudanza = serviceType === "FLETE" || serviceType === "MUDANZA"
  const isEscombros = serviceType === "ESCOMBROS"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl">
            {service ? "Editar Servicio" : "Nuevo Servicio"}
          </DialogTitle>
          <DialogDescription className="text-sm md:text-base">
            {service
              ? "Modifica los datos del servicio"
              : "Completa los datos del servicio"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 md:space-y-6">
          {/* DATOS DEL CLIENTE */}
          <div className="space-y-4 border-b pb-4">
            <h3 className="font-semibold text-sm md:text-base text-muted-foreground">
              Datos del Cliente
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName" className="text-sm md:text-base">
                  Nombre *
                </Label>
                <Input
                  id="clientName"
                  {...register("clientName")}
                  placeholder="Juan Pérez"
                  className="text-sm md:text-base"
                />
                {errors.clientName && (
                  <p className="text-xs md:text-sm text-destructive">
                    {errors.clientName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientPhone" className="text-sm md:text-base">
                  Teléfono *
                </Label>
                <Input
                  id="clientPhone"
                  {...register("clientPhone")}
                  placeholder="+56 9 1234 5678"
                  className="text-sm md:text-base"
                />
                {errors.clientPhone && (
                  <p className="text-xs md:text-sm text-destructive">
                    {errors.clientPhone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientAddress" className="text-sm md:text-base">
                Dirección del Cliente
              </Label>
              <Input
                id="clientAddress"
                {...register("clientAddress")}
                placeholder="Av. Principal 123, Santiago"
                className="text-sm md:text-base"
              />
            </div>
          </div>

          {/* DATOS DEL SERVICIO */}
          <div className="space-y-4 border-b pb-4">
            <h3 className="font-semibold text-sm md:text-base text-muted-foreground">
              Datos del Servicio
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm md:text-base">
                  Tipo de Servicio *
                </Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="text-sm md:text-base">
                        <SelectValue placeholder="Selecciona tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FLETE">Flete</SelectItem>
                        <SelectItem value="MUDANZA">Mudanza</SelectItem>
                        <SelectItem value="ESCOMBROS">Escombros</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.type && (
                  <p className="text-xs md:text-sm text-destructive">
                    {errors.type.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm md:text-base">
                  Estado *
                </Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="text-sm md:text-base">
                        <SelectValue placeholder="Selecciona estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                        <SelectItem value="CONFIRMADO">Confirmado</SelectItem>
                        <SelectItem value="FINALIZADO">Finalizado</SelectItem>
                        <SelectItem value="CANCELADO">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledDate" className="text-sm md:text-base flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  Fecha y Hora *
                </Label>
                <div className="relative">
                  <Input
                    id="scheduledDate"
                    type="datetime-local"
                    {...register("scheduledDate")}
                    className="text-sm md:text-base font-medium pr-3"
                    style={{
                      colorScheme: "light",
                    }}
                  />
                </div>
                {errors.scheduledDate && (
                  <p className="text-xs md:text-sm text-destructive">
                    {errors.scheduledDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm md:text-base">
                  Precio *
                </Label>
                <Input
                  id="price"
                  type="number"
                  {...register("price", { valueAsNumber: true })}
                  placeholder="50000"
                  className="text-sm md:text-base"
                />
                {errors.price && (
                  <p className="text-xs md:text-sm text-destructive">
                    {errors.price.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* CAMPOS SEGÚN TIPO DE SERVICIO */}
          {isFleteOrMudanza && (
            <div className="space-y-4 border-b pb-4">
              <h3 className="font-semibold text-sm md:text-base text-muted-foreground">
                Detalles del {serviceType === "FLETE" ? "Flete" : "Mudanza"}
              </h3>

              <div className="space-y-2">
                <Label htmlFor="origin" className="text-sm md:text-base">
                  Dirección de Origen *
                </Label>
                <Input
                  id="origin"
                  {...register("origin")}
                  placeholder="Av. Principal 123, Santiago"
                  className="text-sm md:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination" className="text-sm md:text-base">
                  Dirección de Destino *
                </Label>
                <Input
                  id="destination"
                  {...register("destination")}
                  placeholder="Calle Secundaria 456, Providencia"
                  className="text-sm md:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cargoDescription" className="text-sm md:text-base">
                  Descripción de Carga
                </Label>
                <Textarea
                  id="cargoDescription"
                  {...register("cargoDescription")}
                  placeholder="Ej: Muebles de oficina, cajas, etc."
                  rows={2}
                  className="text-sm md:text-base resize-none"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="requiresHelper"
                  type="checkbox"
                  {...register("requiresHelper")}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="requiresHelper" className="cursor-pointer text-sm md:text-base">
                  ¿Requiere ayudante?
                </Label>
              </div>
            </div>
          )}

          {isEscombros && (
            <div className="space-y-4 border-b pb-4">
              <h3 className="font-semibold text-sm md:text-base text-muted-foreground">
                Detalles del Retiro de Escombros
              </h3>

              <div className="space-y-2">
                <Label htmlFor="origin" className="text-sm md:text-base">
                  Dirección de Retiro *
                </Label>
                <Input
                  id="origin"
                  {...register("origin")}
                  placeholder="Av. Principal 123, Santiago"
                  className="text-sm md:text-base"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="debrisType" className="text-sm md:text-base">
                    Tipo de Escombro *
                  </Label>
                  <Controller
                    name="debrisType"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="text-sm md:text-base">
                          <SelectValue placeholder="Selecciona tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OBRA">Obra</SelectItem>
                          <SelectItem value="TIERRA">Tierra</SelectItem>
                          <SelectItem value="MADERA">Madera</SelectItem>
                          <SelectItem value="ARIDOS">Áridos</SelectItem>
                          <SelectItem value="MIXTO">Mixto</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="debrisQuantity" className="text-sm md:text-base">
                    Cantidad *
                  </Label>
                  <Controller
                    name="debrisQuantity"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="text-sm md:text-base">
                          <SelectValue placeholder="Selecciona cantidad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PEQUENO">Pequeño (1 colchón, 1 refrigerador, etc.)</SelectItem>
                          <SelectItem value="MEDIO_CAMION">Medio camión</SelectItem>
                          <SelectItem value="LLENO">Camión lleno</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </div>
          )}

          {/* NOTAS */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm md:text-base">
              Notas Internas
            </Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Información adicional sobre el servicio..."
              rows={3}
              className="text-sm md:text-base resize-none"
            />
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting
                ? "Guardando..."
                : service
                ? "Actualizar"
                : "Crear Servicio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
