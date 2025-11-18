// API Client para Módulo de Caja

export interface CashMovement {
  id: string
  organizationId: string
  type: "INGRESO" | "GASTO"
  amount: number
  method: "EFECTIVO" | "TRANSFERENCIA"
  transferAccountId?: string | null
  category?: string
  description?: string
  relatedService?: string
  date: Date | string
  createdAt: Date | string
  updatedAt: Date | string
}

export interface CreateCashMovementDTO {
  type: "INGRESO" | "GASTO"
  amount: number
  method: "EFECTIVO" | "TRANSFERENCIA"
  transferAccountId?: string
  category?: string
  description?: string
  relatedService?: string
  date?: Date | string
}

export interface DailyClose {
  id: string
  organizationId: string
  date: Date | string
  totalCash: number
  transferTotals?: Record<string, number> // { accountId: amount }
  totalExpenses: number
  finalCash: number
  notes?: string
  closedBy?: string
  createdAt: Date | string
  updatedAt: Date | string
}

export interface CreateDailyCloseDTO {
  date: Date | string
  totalCash: number
  transferTotals?: Record<string, number> // { accountId: amount }
  totalExpenses: number
  finalCash: number
  notes?: string
}

export interface CashStats {
  totalIngresos: number
  totalGastos: number
  balance: number
  efectivo: number
  transferencias: { accountId: string; accountName: string; total: number }[]
  ingresosPorCategoria: { category: string; total: number }[]
  gastosPorCategoria: { category: string; total: number }[]
  ingresosUltimas4Semanas: { semana: string; total: number }[]
}

// ===== CASH MOVEMENTS =====

export async function getCashMovements(params?: {
  startDate?: string
  endDate?: string
  type?: "INGRESO" | "GASTO"
}): Promise<CashMovement[]> {
  const searchParams = new URLSearchParams()
  if (params?.startDate) searchParams.set("startDate", params.startDate)
  if (params?.endDate) searchParams.set("endDate", params.endDate)
  if (params?.type) searchParams.set("type", params.type)

  const res = await fetch(`/api/cash/movements?${searchParams.toString()}`)
  if (!res.ok) throw new Error("Error al obtener movimientos")
  return res.json()
}

export async function createCashMovement(
  data: CreateCashMovementDTO
): Promise<CashMovement> {
  const res = await fetch("/api/cash/movements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Error al crear movimiento")
  return res.json()
}

export async function updateCashMovement(
  id: string,
  data: Partial<CreateCashMovementDTO>
): Promise<CashMovement> {
  const res = await fetch(`/api/cash/movements/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Error al actualizar movimiento")
  return res.json()
}

export async function deleteCashMovement(id: string): Promise<void> {
  const res = await fetch(`/api/cash/movements/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Error al eliminar movimiento")
}

// ===== DAILY CLOSES =====

export async function getDailyCloses(params?: {
  startDate?: string
  endDate?: string
}): Promise<DailyClose[]> {
  const searchParams = new URLSearchParams()
  if (params?.startDate) searchParams.set("startDate", params.startDate)
  if (params?.endDate) searchParams.set("endDate", params.endDate)

  const res = await fetch(`/api/cash/close?${searchParams.toString()}`)
  if (!res.ok) throw new Error("Error al obtener cierres")
  return res.json()
}

export async function createDailyClose(
  data: CreateDailyCloseDTO
): Promise<DailyClose> {
  const res = await fetch("/api/cash/close", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Error al crear cierre")
  return res.json()
}

export async function getDailyCloseByDate(date: string): Promise<DailyClose | null> {
  const res = await fetch(`/api/cash/close/${date}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error("Error al obtener cierre")
  return res.json()
}

// ===== STATS =====

export async function getCashStats(params?: {
  startDate?: string
  endDate?: string
}): Promise<CashStats> {
  const searchParams = new URLSearchParams()
  if (params?.startDate) searchParams.set("startDate", params.startDate)
  if (params?.endDate) searchParams.set("endDate", params.endDate)

  const res = await fetch(`/api/cash/stats?${searchParams.toString()}`)
  if (!res.ok) throw new Error("Error al obtener estadísticas")
  return res.json()
}
