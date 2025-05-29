import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Bu middleware, tüm istekleri loglar ve yönlendirme sorunlarını tespit etmeye yardımcı olur
export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Güvenlik başlıkları
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "SAMEORIGIN")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://maps.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://www.google-analytics.com https://maps.googleapis.com; frame-src 'self' https://www.google.com https://www.youtube.com; object-src 'none'",
  )

  // Önbellek başlıkları - statik içerikler için
  const url = request.nextUrl.pathname
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
  ) {
    response.headers.set("Cache-Control", "public, max-age=31536000, immutable")
  }

  // HTML sayfaları için önbellek başlıkları
  else if (!url.includes("/api/") && !url.includes("/_next/")) {
    response.headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400")
  }

  // Yönlendirme kontrolü
  if (url === "/blog" || url.startsWith("/blog/")) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // LOG_LEVEL çevre değişkenini kontrol et
  const logLevel = process.env.LOG_LEVEL || "info"

  // Sadece debug modunda detaylı loglama yap
  if (logLevel === "debug") {
    console.log(`[Middleware] İstek: ${request.method} ${request.nextUrl.pathname}`)
    console.log(`[Middleware] Referrer: ${request.headers.get("referer") || "Yok"}`)
  }

  // Yönlendirme döngüsünü tespit et
  const redirectCount = Number.parseInt(request.headers.get("x-redirect-count") || "0")

  if (redirectCount > 5) {
    console.error(`[Middleware] Yönlendirme döngüsü tespit edildi: ${request.nextUrl.pathname}`)

    // Yönlendirme döngüsünü kır ve hata sayfasına yönlendir
    return NextResponse.redirect(new URL("/hata?kod=redirect_loop", request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
