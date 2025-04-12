"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)

  // Scroll olayını dinle
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex justify-center items-center">
          {/* Sadece Logo/Başlık */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-primary">işletmenionecikar</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
