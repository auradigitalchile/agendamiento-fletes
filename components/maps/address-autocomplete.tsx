"use client"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AddressAutocompleteProps {
  label: string
  value?: string
  onChange: (address: string) => void
  placeholder?: string
  required?: boolean
  id?: string
}

export function AddressAutocomplete({
  label,
  value = "",
  onChange,
  placeholder,
  required = false,
  id,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState(value)

  useEffect(() => {
    if (!inputRef.current) return

    // Verificar que la API de Google Maps esté cargada
    if (typeof window === "undefined" || !window.google) {
      console.warn("Google Maps API no está cargada")
      return
    }

    // Inicializar el autocompletado de Google Places
    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        componentRestrictions: { country: "cl" }, // Restringir a Chile
        fields: ["formatted_address", "geometry", "name"],
      }
    )

    // Listener para cuando se selecciona un lugar
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace()

      if (!place.formatted_address) {
        console.warn("No se pudo obtener la dirección")
        return
      }

      setInputValue(place.formatted_address)
      onChange(place.formatted_address)
    })

    // Cleanup
    return () => {
      if (autocomplete) {
        window.google.maps.event.clearInstanceListeners(autocomplete)
      }
    }
  }, [onChange])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && "*"}
      </Label>
      <Input
        ref={inputRef}
        id={id}
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder || "Ingresa una dirección"}
        autoComplete="off"
      />
    </div>
  )
}
