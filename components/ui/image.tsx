"use client"

import NextImage, { type ImageProps as NextImageProps } from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface ImageProps extends Omit<NextImageProps, "onLoad" | "onError"> {
  fallback?: string
  className?: string
  imgClassName?: string
  aspectRatio?: "auto" | "square" | "video" | "portrait" | "custom"
  customAspectRatio?: string
}

export function Image({
  src,
  alt,
  fallback = "/placeholder.svg",
  width,
  height,
  className,
  imgClassName,
  aspectRatio = "auto",
  customAspectRatio,
  ...props
}: ImageProps) {
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Aspect ratio sınıfları
  const aspectRatioClasses = {
    auto: "",
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    custom: "",
  }

  // Görsel yüklendiğinde
  const handleLoad = () => {
    setLoaded(true)
  }

  // Görsel yüklenemediğinde
  const handleError = () => {
    setError(true)
  }

  // Özel aspect ratio için style
  const customAspectRatioStyle = aspectRatio === "custom" && customAspectRatio ? { aspectRatio: customAspectRatio } : {}

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        aspectRatio !== "auto" && aspectRatioClasses[aspectRatio],
        !loaded && "bg-muted animate-pulse",
        className,
      )}
      style={customAspectRatioStyle}
    >
      <NextImage
        src={error ? fallback : src}
        alt={alt}
        width={width}
        height={height}
        className={cn("transition-opacity duration-300", loaded ? "opacity-100" : "opacity-0", imgClassName)}
        {...props}
        onLoad={(event) => {
          handleLoad()
          if (props.onLoadingComplete) {
            props.onLoadingComplete(event.currentTarget as HTMLImageElement)
          }
        }}
        onError={handleError}
      />
    </div>
  )
}
