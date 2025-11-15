import axios from "axios"

export interface Service {
  id: string
  type: "FLETE" | "MUDANZA" | "ESCOMBROS"
  status: "PENDIENTE" | "CONFIRMADO" | "FINALIZADO" | "CANCELADO"
  scheduledDate: string
  price: number

  // Datos del cliente (inline)
  clientName: string
  clientPhone: string
  clientAddress?: string | null

  origin?: string | null
  destination?: string | null
  cargoDescription?: string | null
  requiresHelper: boolean
  debrisType?: "OBRA" | "TIERRA" | "MADERA" | "ARIDOS" | "MIXTO" | null
  debrisQuantity?: "PEQUENO" | "MEDIO_CAMION" | "LLENO" | null
  notes?: string | null

  // Relación opcional con cliente recurrente
  clientId?: string | null
  client?: {
    id: string
    name: string
    phone: string
  } | null

  createdAt: string
  updatedAt: string
}

export interface CreateServiceDTO {
  // Datos del cliente (inline)
  clientName: string
  clientPhone: string
  clientAddress?: string

  // Datos del servicio
  type: "FLETE" | "MUDANZA" | "ESCOMBROS"
  status?: "PENDIENTE" | "CONFIRMADO" | "FINALIZADO" | "CANCELADO"
  scheduledDate: string | Date
  price: number

  // Campos según tipo de servicio
  origin?: string
  destination?: string
  cargoDescription?: string
  requiresHelper?: boolean
  debrisType?: "OBRA" | "TIERRA" | "MADERA" | "ARIDOS" | "MIXTO"
  debrisQuantity?: "PEQUENO" | "MEDIO_CAMION" | "LLENO"
  notes?: string

  // Opcional: vincular a cliente recurrente
  clientId?: string
}

export interface UpdateServiceDTO extends CreateServiceDTO {}

export interface ServiceFilters {
  type?: string
  status?: string
  clientId?: string
  startDate?: string
  endDate?: string
}

/**
 * Obtiene todos los servicios con filtros opcionales
 */
export async function getServices(filters?: ServiceFilters): Promise<Service[]> {
  const params = new URLSearchParams()
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
  }

  const response = await axios.get(`/api/services?${params.toString()}`)
  return response.data
}

/**
 * Obtiene un servicio por ID
 */
export async function getService(id: string): Promise<Service> {
  const response = await axios.get(`/api/services/${id}`)
  return response.data
}

/**
 * Crea un nuevo servicio
 */
export async function createService(data: CreateServiceDTO): Promise<Service> {
  const response = await axios.post("/api/services", data)
  return response.data
}

/**
 * Actualiza un servicio
 */
export async function updateService(
  id: string,
  data: UpdateServiceDTO
): Promise<Service> {
  const response = await axios.put(`/api/services/${id}`, data)
  return response.data
}

/**
 * Elimina un servicio
 */
export async function deleteService(id: string): Promise<void> {
  await axios.delete(`/api/services/${id}`)
}

/**
 * Exporta servicios a CSV
 */
export async function exportServices(month: string): Promise<void> {
  const response = await axios.get(`/api/export?month=${month}`, {
    responseType: "blob",
  })

  // Descargar archivo
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", `servicios-${month}.csv`)
  document.body.appendChild(link)
  link.click()
  link.remove()
}
