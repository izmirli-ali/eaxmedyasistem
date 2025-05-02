"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"

// Google Maps API'sinin yüklenip yüklenmediğini takip etmek için global değişken
let isGoogleMapsLoaded = false

interface AddressAutocompleteProps {
  value: string
  onChange: (address: string, placeData?: google.maps.places.PlaceResult) => void
  placeholder?: string
  error?: string
}

export function AddressAutocomplete({ value, onChange, placeholder, error }: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Google Maps API'sini yükle
  useEffect(() => {
    // Eğer API zaten yüklenmişse tekrar yükleme
    if (window.google?.maps?.places || isGoogleMapsLoaded) {
      initAutocomplete()
      return
    }

    setIsLoading(true)
    isGoogleMapsLoaded = true

    // API key'i çevre değişkeninden al
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    // Script elementini oluştur
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMapsAutocomplete`
    script.async = true
    script.defer = true

    // Global callback fonksiyonu
    window.initGoogleMapsAutocomplete = () => {
      setIsLoading(false)
      initAutocomplete()
    }

    // Hata durumunda
    script.onerror = () => {
      console.error("Google Maps API yüklenemedi")
      setIsLoading(false)
    }

    document.head.appendChild(script)

    return () => {
      // Temizlik işlemi
      window.initGoogleMapsAutocomplete = () => {}
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  // Autocomplete'i başlat
  const initAutocomplete = () => {
    if (!inputRef.current || !window.google?.maps?.places) return

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ["address"],
      componentRestrictions: { country: "tr" },
      fields: ["address_components", "formatted_address", "geometry", "name"],
    })

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace()
      if (place && place.formatted_address) {
        onChange(place.formatted_address, place)
      }
    })
  }

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Adres girin"}
        className={error ? "border-destructive" : ""}
        disabled={isLoading}
      />
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  )
}

// Global tiplemeler
declare global {
  interface Window {
    initGoogleMapsAutocomplete: () => void
    google?: {
      maps?: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: google.maps.places.AutocompleteOptions,
          ) => google.maps.places.Autocomplete
        }
      }
    }
  }
}
