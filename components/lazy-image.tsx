"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  sizes?: string
  quality?: number
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down"
  onLoad?: () => void
  fetchPriority?: "high" | "low" | "auto"
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  quality = 75,
  objectFit = "cover",
  onLoad,
  fetchPriority = "auto",
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(!priority)
  const [error, setError] = useState(false)
  const [imageSrc, setImageSrc] = useState(src || "/placeholder.svg")
  const imageRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // Src değiştiğinde yükleme durumunu sıfırla
    if (!priority) {
      setIsLoading(true)
    }
    setError(false)
    setImageSrc(src || "/placeholder.svg")
  }, [src, priority])

  useEffect(() => {
    // Intersection Observer ile görünür olduğunda yükleme
    if (!priority && imageRef.current && "IntersectionObserver" in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Görünür olduğunda yüksek öncelikle yükle
              if (imageRef.current) {
                imageRef.current.fetchPriority = "high"
              }
              // Observer'ı temizle
              if (observerRef.current) {
                observerRef.current.disconnect()
              }
            }
          })
        },
        { rootMargin: "200px" }, // 200px önce yüklemeye başla
      )

      observerRef.current.observe(imageRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [priority])

  const handleLoad = () => {
    setIsLoading(false)
    if (onLoad) onLoad()
  }

  const handleError = () => {
    setIsLoading(false)
    setError(true)
    setImageSrc("/placeholder.svg")
  }

  return (
    <div className={cn("relative", className)} style={{ height: fill ? "100%" : "auto" }}>
      {isLoading && (
        <Skeleton
          className={cn("absolute inset-0 z-10", className)}
          style={{ width: fill ? "100%" : width, height: fill ? "100%" : height }}
        />
      )}
      <Image
        ref={imageRef}
        src={imageSrc || "/placeholder.svg"}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          objectFit === "cover" && "object-cover",
          objectFit === "contain" && "object-contain",
          objectFit === "fill" && "object-fill",
          objectFit === "none" && "object-none",
          objectFit === "scale-down" && "object-scale-down",
          className,
        )}
        sizes={sizes}
        quality={quality}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : fetchPriority}
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
          Görsel yüklenemedi
        </div>
      )}
    </div>
  )
}
