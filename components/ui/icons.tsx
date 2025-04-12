import * as React from "react"
import { ChevronLeftIcon, Share2Icon, MapPinIcon } from "lucide-react"

export const ChevronLeft = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(({ ...props }, ref) => {
  return <ChevronLeftIcon ref={ref} {...props} />
})

ChevronLeft.displayName = "ChevronLeft"

export const Share2 = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(({ ...props }, ref) => {
  return <Share2Icon ref={ref} {...props} />
})

Share2.displayName = "Share2"

export const MapPin = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(({ ...props }, ref) => {
  return <MapPinIcon ref={ref} {...props} />
})

MapPin.displayName = "MapPin"
