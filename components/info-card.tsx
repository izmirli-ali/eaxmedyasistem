import type React from "react"
import { cn } from "@/lib/utils"

interface InfoCardProps {
  children: React.ReactNode
  className?: string
}

export function InfoCard({ children, className }: InfoCardProps) {
  return <div className={cn("bg-white rounded-lg border shadow-sm p-6 animate-fade-in", className)}>{children}</div>
}
