// Yükleme overlay bileşeni
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface LoadingOverlayProps {
  isLoading: boolean
  text?: string
}

export function LoadingOverlay({ isLoading, text }: LoadingOverlayProps) {
  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <LoadingSpinner size="lg" text={text || "Yükleniyor..."} />
    </div>
  )
}
