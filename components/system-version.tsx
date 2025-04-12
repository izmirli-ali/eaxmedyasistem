"use client"

import { useState, useEffect } from "react"
import { getCurrentVersion } from "@/lib/version-control"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"

export function SystemVersion() {
  const [version, setVersion] = useState("1.0.0")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadVersion() {
      try {
        const currentVersion = await getCurrentVersion()
        setVersion(currentVersion)
      } catch (error) {
        console.error("Sürüm bilgisi yüklenirken hata:", error)
      } finally {
        setLoading(false)
      }
    }

    loadVersion()
  }, [])

  if (loading) {
    return <span className="text-xs text-muted-foreground">Yükleniyor...</span>
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-help">
            <Badge variant="outline" className="text-xs">
              v{version}
            </Badge>
            <Info className="h-3 w-3 text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Sistem sürümü: {version}</p>
          <p className="text-xs text-muted-foreground">Son güncelleme: {new Date().toLocaleDateString()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
