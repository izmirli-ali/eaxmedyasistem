import { LoadingOverlay } from "@/components/ui/loading-overlay"

export default function HaritaLoading() {
  return (
    <div className="w-full h-full min-h-[500px] relative">
      <LoadingOverlay message="Harita yükleniyor..." />
    </div>
  )
}
