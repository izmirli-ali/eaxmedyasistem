"use client"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
}

export function LoadingSpinner({ size = "md", text, className }: LoadingSpinnerProps) {
  let spinnerSize = "h-6 w-6"
  let textSize = "text-sm"

  if (size === "sm") {
    spinnerSize = "h-4 w-4"
    textSize = "text-xs"
  } else if (size === "lg") {
    spinnerSize = "h-8 w-8"
    textSize = "text-lg"
  }

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <Loader2 className={cn(spinnerSize, "animate-spin text-blue-600")} />
      {text && <p className={cn("mt-2 text-gray-500", textSize)}>{text}</p>}
    </div>
  )
}
