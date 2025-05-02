"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageSliderProps {
  images: { url: string; alt?: string }[]
  className?: string
  autoPlay?: boolean
  interval?: number
}

export function ImageSlider({ images, className, autoPlay = true, interval = 5000 }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
  }, [images.length])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
  }, [images.length])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  // Otomatik geçiş için
  useEffect(() => {
    if (!autoPlay || images.length <= 1) return

    const timer = setInterval(() => {
      goToNext()
    }, interval)

    return () => clearInterval(timer)
  }, [autoPlay, interval, goToNext, images.length])

  // Dokunma olayları için
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // Sola kaydırma
      goToNext()
    }

    if (touchStart - touchEnd < -50) {
      // Sağa kaydırma
      goToPrevious()
    }
  }

  // Klavye olayları için
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrevious()
      } else if (e.key === "ArrowRight") {
        goToNext()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [goToNext, goToPrevious])

  if (images.length === 0) {
    return null
  }

  return (
    <div
      className={cn("relative overflow-hidden rounded-lg group", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent z-10" aria-hidden="true" />

      {/* Slider */}
      <div
        className="flex transition-transform duration-500 ease-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={index} className="min-w-full h-full relative">
            <Image
              src={image.url || "/placeholder.svg"}
              alt={image.alt || "Slider image"}
              fill
              className={cn("object-cover transition-opacity duration-500", isLoading ? "opacity-0" : "opacity-100")}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              priority={index === 0}
              onLoad={() => setIsLoading(false)}
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFdwI2QOQvuQAAAABJRU5ErkJggg=="
            />
          </div>
        ))}
      </div>

      {/* Yükleniyor göstergesi */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Navigasyon butonları */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-20"
            aria-label="Önceki görsel"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-20"
            aria-label="Sonraki görsel"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Nokta göstergeleri */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all",
                currentIndex === index ? "bg-white w-6" : "bg-white/50 hover:bg-white/80",
              )}
              aria-label={`${index + 1}. görsele git`}
              aria-current={currentIndex === index ? "true" : "false"}
            />
          ))}
        </div>
      )}
    </div>
  )
}
