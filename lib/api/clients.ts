import axios from "axios"

export interface Client {
  id: string
  name: string
  phone: string
  email?: string | null
  defaultAddress?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
  services?: any[]
  _count?: {
    services: number
  }
}

export interface CreateClientDTO {
  name: string
  phone: string
  email?: string
  defaultAddress?: string
  notes?: string
}

export interface UpdateClientDTO extends CreateClientDTO {}

/**
 * Obtiene todos los clientes
 */
export async function getClients(search?: string): Promise<Client[]> {
  const params = new URLSearchParams()
  if (search) params.append("search", search)

  const response = await axios.get(`/api/clients?${params.toString()}`)
  return response.data
}

/**
 * Obtiene un cliente por ID
 */
export async function getClient(id: string): Promise<Client> {
  const response = await axios.get(`/api/clients/${id}`)
  return response.data
}

/**
 * Crea un nuevo cliente
 */
export async function createClient(data: CreateClientDTO): Promise<Client> {
  const response = await axios.post("/api/clients", data)
  return response.data
}

/**
 * Actualiza un cliente
 */
export async function updateClient(
  id: string,
  data: UpdateClientDTO
): Promise<Client> {
  const response = await axios.put(`/api/clients/${id}`, data)
  return response.data
}

/**
 * Elimina un cliente
 */
export async function deleteClient(id: string): Promise<void> {
  await axios.delete(`/api/clients/${id}`)
}
