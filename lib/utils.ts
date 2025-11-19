import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea un número como precio en formato chileno
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(amount)
}

/**
 * Formatea una fecha en formato legible
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

/**
 * Formatea una fecha y hora en formato legible
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-CL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Obtiene el color asociado a un tipo de servicio
 */
export function getServiceTypeColor(type: string): string {
  const colors: Record<string, string> = {
    FLETE: 'hsl(217, 91%, 60%)',
    MUDANZA: 'hsl(142, 76%, 36%)',
    ESCOMBROS: 'hsl(25, 95%, 53%)',
  }
  return colors[type] || colors.FLETE
}

/**
 * Obtiene el label en español de un tipo de servicio
 */
export function getServiceTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    FLETE: 'Flete',
    MUDANZA: 'Mudanza',
    ESCOMBROS: 'Escombros',
  }
  return labels[type] || type
}

/**
 * Obtiene el label en español de un estado de servicio
 */
export function getServiceStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDIENTE: 'Pendiente',
    CONFIRMADO: 'Confirmado',
    FINALIZADO: 'Finalizado',
    CANCELADO: 'Cancelado',
  }
  return labels[status] || status
}

/**
 * Obtiene el label en español de un tipo de escombro
 */
export function getDebrisTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    OBRA: 'Obra',
    TIERRA: 'Tierra',
    MADERA: 'Madera',
    ARIDOS: 'Áridos',
    MIXTO: 'Mixto',
  }
  return labels[type] || type
}

/**
 * Obtiene el label en español de una cantidad de escombro
 */
export function getDebrisQuantityLabel(quantity: string): string {
  const labels: Record<string, string> = {
    MEDIO_CAMION: 'Medio camión',
    LLENO: 'Camión lleno',
  }
  return labels[quantity] || quantity
}

/**
 * Parsea una fecha string (yyyy-MM-dd) como fecha local, NO como UTC
 * Esto evita el problema de timezone donde "2024-11-19" se interpreta como UTC
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Obtiene el inicio del día (00:00:00.000) para una fecha dada
 * Funciona con el timezone local del navegador/servidor
 */
export function getLocalStartOfDay(date: Date | string): Date {
  const d = typeof date === 'string' ? parseLocalDate(date) : new Date(date)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
}

/**
 * Obtiene el fin del día (23:59:59.999) para una fecha dada
 * Funciona con el timezone local del navegador/servidor
 */
export function getLocalEndOfDay(date: Date | string): Date {
  const d = typeof date === 'string' ? parseLocalDate(date) : new Date(date)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
}

/**
 * Convierte un string de fecha a medianoche local y retorna ISO string
 * Útil para enviar fechas al backend manteniendo el día correcto
 */
export function toLocalMidnight(dateString: string): string {
  return getLocalStartOfDay(dateString).toISOString()
}

/**
 * Obtiene la fecha actual en formato yyyy-MM-dd
 */
export function getTodayString(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
