/**
 * Performans optimizasyonu için yardımcı fonksiyonlar
 */

// Görsel boyutlarını hesaplamak için yardımcı fonksiyon
export function calculateImageDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  // En-boy oranını koru
  const aspectRatio = originalWidth / originalHeight

  let width = maxWidth
  let height = width / aspectRatio

  if (height > maxHeight) {
    height = maxHeight
    width = height * aspectRatio
  }

  return { width: Math.round(width), height: Math.round(height) }
}

// Görsel URL'sini optimize etmek için yardımcı fonksiyon
export function getOptimizedImageUrl(url: string, width?: number, quality = 75): string {
  if (!url) return ""

  // Zaten optimize edilmiş URL'leri tekrar optimize etme
  if (url.includes("?w=") || url.includes("&w=")) return url

  // Yerel görseller için Next.js görsel optimizasyonu
  if (url.startsWith("/")) {
    const params = new URLSearchParams()
    if (width) params.append("w", width.toString())
    params.append("q", quality.toString())
    return `${url}?${params.toString()}`
  }

  // Harici görseller için
  try {
    const urlObj = new URL(url)

    // Vercel Blob Storage görselleri için
    if (urlObj.hostname.includes("blob.vercel-storage.com")) {
      const params = new URLSearchParams(urlObj.search)
      if (width) params.set("w", width.toString())
      params.set("q", quality.toString())
      return `${urlObj.origin}${urlObj.pathname}?${params.toString()}`
    }

    // Diğer harici görseller için orijinal URL'yi döndür
    return url
  } catch (error) {
    // URL parse edilemezse orijinal URL'yi döndür
    return url
  }
}

// Sayfa yükleme performansını ölçmek için yardımcı fonksiyon
export function measurePagePerformance(): void {
  if (typeof window === "undefined" || !window.performance || !window.performance.timing) return

  window.addEventListener("load", () => {
    setTimeout(() => {
      const timing = window.performance.timing

      // Temel performans metrikleri
      const pageLoadTime = timing.loadEventEnd - timing.navigationStart
      const domContentLoadedTime = timing.domContentLoadedEventEnd - timing.navigationStart
      const firstPaintTime = timing.responseEnd - timing.navigationStart
      const backendTime = timing.responseStart - timing.navigationStart
      const frontendTime = timing.loadEventEnd - timing.responseStart

      // Konsola yazdır
      console.log("Sayfa Yükleme Performansı:")
      console.log(`Toplam Yükleme Süresi: ${pageLoadTime}ms`)
      console.log(`DOM İçeriği Yükleme Süresi: ${domContentLoadedTime}ms`)
      console.log(`İlk Boya Süresi: ${firstPaintTime}ms`)
      console.log(`Backend Süresi: ${backendTime}ms`)
      console.log(`Frontend Süresi: ${frontendTime}ms`)

      // Analytics'e gönder (isteğe bağlı)
      if (window.gtag) {
        window.gtag("event", "page_performance", {
          page_load_time: pageLoadTime,
          dom_content_loaded_time: domContentLoadedTime,
          first_paint_time: firstPaintTime,
          backend_time: backendTime,
          frontend_time: frontendTime,
        })
      }
    }, 0)
  })
}

// Lazy loading için Intersection Observer yardımcı fonksiyonu
export function createLazyLoadObserver(callback: IntersectionObserverCallback): IntersectionObserver | null {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) return null

  return new IntersectionObserver(callback, {
    rootMargin: "200px", // Görünür alandan 200px önce yüklemeye başla
    threshold: 0.01, // %1 görünür olduğunda tetikle
  })
}

// Kritik CSS'leri inline olarak eklemek için yardımcı fonksiyon
export function injectCriticalCSS(css: string): void {
  if (typeof document === "undefined") return

  const style = document.createElement("style")
  style.setAttribute("data-critical", "true")
  style.textContent = css
  document.head.appendChild(style)
}

// Önbellek kontrolü için yardımcı fonksiyon
export function isCacheable(url: string): boolean {
  // API rotaları ve dinamik sayfalar önbelleğe alınmamalı
  if (url.includes("/api/") || url.includes("/_next/data/")) return false

  // Statik içerikler önbelleğe alınabilir
  if (
    url.includes(".js") ||
    url.includes(".css") ||
    url.includes(".jpg") ||
    url.includes(".jpeg") ||
    url.includes(".png") ||
    url.includes(".gif") ||
    url.includes(".svg") ||
    url.includes(".ico") ||
    url.includes(".woff") ||
    url.includes(".woff2")
  )
    return true

  // Diğer sayfalar için varsayılan olarak önbelleğe alınabilir
  return true
}

// Önbellek süresi hesaplama yardımcı fonksiyonu
export function getCacheDuration(url: string): number {
  // Statik içerikler için 1 yıl
  if (
    url.includes(".js") ||
    url.includes(".css") ||
    url.includes(".jpg") ||
    url.includes(".jpeg") ||
    url.includes(".png") ||
    url.includes(".gif") ||
    url.includes(".svg") ||
    url.includes(".ico") ||
    url.includes(".woff") ||
    url.includes(".woff2")
  )
    return 31536000 // 1 yıl (saniye cinsinden)

  // HTML sayfaları için 1 saat
  return 3600 // 1 saat (saniye cinsinden)
}
