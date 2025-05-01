"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Leaflet icon sorunu için çözüm
const getDefaultIcon = () => {
  return L.icon({
    iconUrl: "/images/marker-icon.png",
    shadowUrl: "/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })
}

// Harita içinde kullanılacak marker bileşeni
function LocationMarker({
  position,
  setPosition,
}: {
  position: [number, number] | null
  setPosition: (pos: [number, number]) => void
}) {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng])
      map.flyTo(e.latlng, map.getZoom())
    },
  })

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom())
    }
  }, [position, map])

  return position ? (
    <Marker position={position} icon={getDefaultIcon()}>
      <Popup>Bu konumu seçtiniz</Popup>
    </Marker>
  ) : null
}

export function MapComponent({
  position,
  setPosition,
}: {
  position: [number, number] | null
  setPosition: (pos: [number, number]) => void
}) {
  // Leaflet icon'u ayarla
  useEffect(() => {
    // @ts-ignore - Leaflet tiplemesi tam değil
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconUrl: "/images/marker-icon.png",
      shadowUrl: "/images/marker-shadow.png",
    })
  }, [])

  return (
    <MapContainer
      center={position || [39.925533, 32.866287]}
      zoom={position ? 16 : 6}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker position={position} setPosition={setPosition} />
    </MapContainer>
  )
}
