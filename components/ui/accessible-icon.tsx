import type React from "react"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface AccessibleIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string
  icon: React.ReactNode
}

export const AccessibleIcon = forwardRef<HTMLSpanElement, AccessibleIconProps>(
  ({ label, icon, className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn("inline-flex items-center justify-center", className)}
        role="img"
        aria-label={label}
        {...props}
      >
        {icon}
      </span>
    )
  },
)

AccessibleIcon.displayName = "AccessibleIcon"
