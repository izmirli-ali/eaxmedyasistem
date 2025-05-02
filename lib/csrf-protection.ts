/**
 * CSRF koruması için yardımcı fonksiyonlar
 */
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"
import crypto from "crypto"

// CSRF token oluştur
export function generateCsrfToken(): string {
  const token = crypto.randomBytes(32).toString("hex")
  cookies().set("csrf-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  })
  return token
}

// CSRF token doğrula
export function validateCsrfToken(request: NextRequest): boolean {
  const cookieToken = cookies().get("csrf-token")?.value
  const headerToken = request.headers.get("x-csrf-token")

  if (!cookieToken || !headerToken) {
    return false
  }

  return cookieToken === headerToken
}

// API rotaları için CSRF koruma middleware
export async function csrfProtect(request: NextRequest): Promise<boolean> {
  // GET istekleri için CSRF koruması gerekmez
  if (request.method === "GET") {
    return true
  }

  return validateCsrfToken(request)
}
