import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <h2 className="text-xl font-bold mb-2">Yükleniyor</h2>
        <p>Başvurular yükleniyor...</p>
      </div>
    </div>
  )
}
