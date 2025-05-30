import type React from "react"
import "./globals.css"
import { Inter, Playfair_Display } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">{children}</body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
