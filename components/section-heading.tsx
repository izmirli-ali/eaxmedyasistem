import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  title: string
  description?: string
  icon?: LucideIcon
  className?: string
  align?: "left" | "center" | "right"
}

export function SectionHeading({ title, description, icon: Icon, className, align = "left" }: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-6 section-divider",
        {
          "text-center": align === "center",
          "text-right": align === "right",
        },
        className,
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="h-5 w-5 text-primary-500" aria-hidden="true" />}
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      </div>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  )
}
