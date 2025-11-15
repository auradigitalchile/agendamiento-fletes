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
