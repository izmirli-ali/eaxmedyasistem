"use client"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface CalismaDetaylariFormProps {
  formData: any
  onChange: (field: string, value: any) => void
  errors: Record<string, string>
}

export function CalismaDetaylariForm({ formData, onChange, errors }: CalismaDetaylariFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Çalışma Detayları</h3>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="calisma_saatleri">Çalışma Saatleri</Label>
          <Textarea
            id="calisma_saatleri"
            value={formData.calisma_saatleri || ""}
            onChange={(e) => onChange("calisma_saatleri", e.target.value)}
            placeholder="Pazartesi-Cuma: 09:00-18:00, Cumartesi: 10:00-16:00, Pazar: Kapalı"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sunulan_hizmetler">Sunulan Hizmetler</Label>
          <Textarea
            id="sunulan_hizmetler"
            value={formData.sunulan_hizmetler || ""}
            onChange={(e) => onChange("sunulan_hizmetler", e.target.value)}
            placeholder="İşletmenizin sunduğu hizmetleri virgülle ayırarak yazın"
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Hizmetleri virgülle ayırarak yazın (örn: Kahvaltı, Öğle Yemeği, Akşam Yemeği)
          </p>
        </div>
      </div>
    </div>
  )
}
