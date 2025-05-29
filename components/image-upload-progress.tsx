import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertCircle } from "lucide-react"

interface ImageUploadProgressProps {
  fileName: string
  progress: number
  isUploading: boolean
  success?: boolean
  error?: string
}

export function ImageUploadProgress({ fileName, progress, isUploading, success, error }: ImageUploadProgressProps) {
  return (
    <div className="border rounded-md p-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium truncate max-w-[70%]">{fileName}</span>
        <div>
          {isUploading && <span className="text-xs text-muted-foreground">{progress}%</span>}
          {success && <CheckCircle className="h-4 w-4 text-green-500" />}
          {error && <AlertCircle className="h-4 w-4 text-red-500" />}
        </div>
      </div>
      <Progress value={progress} className="h-1" />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
