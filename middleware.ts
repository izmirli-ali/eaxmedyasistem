import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Bu middleware, tüm istekleri loglar ve yönlendirme sorunlarını tespit etmeye yardımcı olur
export function middleware(request: NextRequest) {
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

  // Normal işleme devam et
  return NextResponse.next()
}

// Middleware'in çalışacağı yolları belirt
export const config = {
  matcher: [
    // Admin sayfaları için
    "/admin/:path*",
    // Ana sayfa için
    "/",
    // Diğer sayfalar için gerekirse ekleyin
  ],
}
