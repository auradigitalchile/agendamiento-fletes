"use client"

import { useEffect, useState } from "react"

interface GoogleMapsProviderProps {
  children: React.ReactNode
}

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Verificar si ya está cargada
    if (window.google) {
      setIsLoaded(true)
      return
    }

    // Cargar el script de Google Maps
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      console.error(
        "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY no está configurada en las variables de entorno"
      )
      return
    }

    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true

    script.onload = () => {
      setIsLoaded(true)
    }

    script.onerror = () => {
      console.error("Error al cargar Google Maps API")
    }

    document.head.appendChild(script)

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  return <>{children}</>
}
