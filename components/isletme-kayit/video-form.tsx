"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { VideoIcon, Youtube, ExternalLink, Trash2 } from "lucide-react"
import { VideoPlayer } from "@/components/video-player"

interface VideoFormProps {
  formData: any
  onChange: (field: string, value: any) => void
  errors: Record<string, string>
}

export function VideoForm({ formData, onChange, errors }: VideoFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // YouTube URL'sini kontrol et
  const isValidYoutubeUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    return youtubeRegex.test(url)
  }

  // Video URL'sini kontrol et
  const isValidVideoUrl = (url: string): boolean => {
    const videoRegex = /\.(mp4|webm|ogg)(\?.*)?$/i
    return videoRegex.test(url) || isValidYoutubeUrl(url)
  }

  // Önizleme göster
  const handlePreview = () => {
    if (formData.video_url && isValidVideoUrl(formData.video_url)) {
      setPreviewUrl(formData.video_url)
    } else {
      alert("Lütfen geçerli bir video URL'si girin.")
    }
  }

  // Önizlemeyi kapat
  const handleClosePreview = () => {
    setPreviewUrl(null)
  }

  // Video bilgilerini temizle
  const handleClearVideo = () => {
    onChange("video_url", "")
    onChange("video_baslik", "")
    onChange("video_aciklama", "")
    setPreviewUrl(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-lg font-medium text-primary">
        <VideoIcon className="h-5 w-5" />
        <h3>Video Bilgileri</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="video_url">Video URL</Label>
          <div className="flex gap-2">
            <Input
              id="video_url"
              value={formData.video_url || ""}
              onChange={(e) => onChange("video_url", e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1"
            />
            <Button type="button" variant="outline" onClick={handlePreview} disabled={!formData.video_url}>
              Önizle
            </Button>
          </div>
          {errors.video_url && <p className="text-sm text-red-500">{errors.video_url}</p>}
          <p className="text-xs text-muted-foreground">
            YouTube veya doğrudan video bağlantısı ekleyebilirsiniz (MP4, WebM, OGG)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="video_baslik">Video Başlığı</Label>
          <Input
            id="video_baslik"
            value={formData.video_baslik || ""}
            onChange={(e) => onChange("video_baslik", e.target.value)}
            placeholder="İşletme Tanıtım Videosu"
          />
          {errors.video_baslik && <p className="text-sm text-red-500">{errors.video_baslik}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="video_aciklama">Video Açıklaması</Label>
          <Textarea
            id="video_aciklama"
            value={formData.video_aciklama || ""}
            onChange={(e) => onChange("video_aciklama", e.target.value)}
            placeholder="Video hakkında kısa bir açıklama..."
            rows={3}
          />
          {errors.video_aciklama && <p className="text-sm text-red-500">{errors.video_aciklama}</p>}
        </div>

        {formData.video_url && (
          <div className="flex justify-end">
            <Button type="button" variant="destructive" size="sm" onClick={handleClearVideo}>
              <Trash2 className="h-4 w-4 mr-1" />
              Video Bilgilerini Temizle
            </Button>
          </div>
        )}

        {/* Video Önizleme */}
        {previewUrl && (
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Video Önizleme</h4>
                <Button type="button" variant="ghost" size="sm" onClick={handleClosePreview}>
                  Kapat
                </Button>
              </div>
              <VideoPlayer videoUrl={previewUrl} title={formData.video_baslik || "Video Önizleme"} className="w-full" />
            </CardContent>
          </Card>
        )}

        {/* YouTube Yardımı */}
        {formData.video_url && isValidYoutubeUrl(formData.video_url) && (
          <div className="bg-blue-50 p-4 rounded-md">
            <div className="flex items-start gap-2">
              <Youtube className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">YouTube Video İpuçları</h4>
                <ul className="text-sm text-blue-700 mt-1 space-y-1 list-disc list-inside">
                  <li>YouTube videolarınızı "Herkese Açık" olarak ayarladığınızdan emin olun</li>
                  <li>Video URL'sini kopyalarken tam bağlantıyı kullanın</li>
                  <li>
                    Paylaş butonunu kullanarak doğrudan bağlantıyı kopyalayabilirsiniz
                    <Button type="button" variant="link" size="sm" className="text-blue-600 p-0 h-auto" asChild>
                      <a
                        href="https://support.google.com/youtube/answer/57741"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3 w-3 ml-1" />
                        Daha fazla bilgi
                      </a>
                    </Button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
