// API client para cuentas de transferencia

export interface TransferAccount {
  id: string
  organizationId: string
  name: string
  isActive: boolean
  createdAt: Date | string
  updatedAt: Date | string
}

export interface CreateTransferAccountDTO {
  name: string
}

export interface UpdateTransferAccountDTO {
  name?: string
  isActive?: boolean
}

// Obtener todas las cuentas de transferencia
export async function getTransferAccounts(): Promise<TransferAccount[]> {
  const response = await fetch("/api/transfer-accounts")

  if (!response.ok) {
    throw new Error("Error al obtener cuentas de transferencia")
  }

  return response.json()
}

// Crear nueva cuenta de transferencia
export async function createTransferAccount(
  data: CreateTransferAccountDTO
): Promise<TransferAccount> {
  const response = await fetch("/api/transfer-accounts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Error al crear cuenta de transferencia")
  }

  return response.json()
}

// Actualizar cuenta de transferencia
export async function updateTransferAccount(
  id: string,
  data: UpdateTransferAccountDTO
): Promise<TransferAccount> {
  const response = await fetch(`/api/transfer-accounts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Error al actualizar cuenta de transferencia")
  }

  return response.json()
}

// Eliminar cuenta de transferencia
export async function deleteTransferAccount(id: string): Promise<void> {
  const response = await fetch(`/api/transfer-accounts/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Error al eliminar cuenta de transferencia")
  }
}
