"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface StickyNavProps {
  sections: {
    id: string
    label: string
  }[]
  offset?: number
  className?: string
}

export function StickyNav({ sections, offset = 100, className }: StickyNavProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Scroll pozisyonunu kontrol et
      setIsScrolled(window.scrollY > 50)

      // Hangi bölümün görünür olduğunu kontrol et
      const currentScrollPos = window.scrollY + offset
      let currentSection: string | null = null

      sections.forEach(({ id }) => {
        const element = document.getElementById(id)
        if (element) {
          const { top, bottom } = element.getBoundingClientRect()
          const elementTop = top + window.scrollY
          const elementBottom = bottom + window.scrollY

          if (currentScrollPos >= elementTop && currentScrollPos <= elementBottom) {
            currentSection = id
          }
        }
      })

      setActiveSection(currentSection)
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // İlk yükleme için kontrol et

    return () => window.removeEventListener("scroll", handleScroll)
  }, [sections, offset])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const topPos = element.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({
        top: topPos,
        behavior: "smooth",
      })
    }
  }

  return (
    <div
      className={cn(
        "sticky top-0 bg-white z-30 border-b transition-all sticky-nav",
        isScrolled && "scrolled shadow-sm",
        className,
      )}
    >
      <div className="container flex gap-2 overflow-x-auto py-3 no-scrollbar">
        {sections.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => scrollToSection(id)}
            className={cn(
              "text-sm font-medium whitespace-nowrap px-4 py-2 rounded-full transition-colors mobile-touch-target",
              activeSection === id ? "bg-primary-500 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700",
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
