"use client"

import type React from "react"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface SkipLinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string
  className?: string
}

export const SkipLink = forwardRef<HTMLAnchorElement, SkipLinkProps>(({ href, className, children, ...props }, ref) => {
  return (
    <a
      ref={ref}
      href={href}
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  )
})

SkipLink.displayName = "SkipLink"
