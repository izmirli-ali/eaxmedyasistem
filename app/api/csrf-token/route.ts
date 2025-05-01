// CSRF token API endpoint
import { NextResponse } from "next/server"
import { generateCsrfToken } from "@/lib/csrf-protection"

export async function GET() {
  const token = generateCsrfToken()
  return NextResponse.json({ token })
}
