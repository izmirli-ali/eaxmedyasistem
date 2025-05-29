"use client"

import Image, { type ImageProps } from "next/image"
import { useState, useEffect } from "react"

interface OptimizedImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
  fallbackSrc?: string
  lowQualitySrc?: string
  lazyLoad?: boolean
  fadeIn?: boolean
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc = "/placeholder.svg",
  lowQualitySrc,
  lazyLoad = true,
  fadeIn = true,
  className = "",
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(lowQualitySrc || src)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    // src değiştiğinde state'i sıfırla
    setImgSrc(lowQualitySrc || src)
    setIsLoaded(false)
    setError(false)
  }, [src, lowQualitySrc])

  const handleLoad = () => {
    // Düşük kaliteli görsel kullanılıyorsa, yüksek kaliteli görseli yükle
    if (lowQualitySrc && imgSrc === lowQualitySrc) {
      setImgSrc(src)
    } else {
      setIsLoaded(true)
    }
  }

  const handleError = () => {
    setError(true)
    setImgSrc(fallbackSrc)
  }

  // Fade-in efekti için stil sınıfları
  const imageClasses = [
    className,
    fadeIn && !isLoaded ? "opacity-0" : "opacity-100",
    fadeIn ? "transition-opacity duration-500" : "",
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <Image
      src={error ? fallbackSrc : imgSrc}
      alt={alt}
      className={imageClasses}
      loading={lazyLoad ? "lazy" : "eager"}
      onLoadingComplete={handleLoad}
      onError={handleError}
      {...props}
    />
  )
}
