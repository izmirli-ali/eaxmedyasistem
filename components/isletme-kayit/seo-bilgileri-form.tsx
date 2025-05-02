"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Search } from "lucide-react"

interface SEOBilgileriFormProps {
  formData: any
  onChange: (field: string, value: any) => void
  errors: Record<string, string>
}

export function SEOBilgileriForm({ formData, onChange, errors }: SEOBilgileriFormProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-lg font-medium text-primary">
        <Search className="h-5 w-5" />
        <h3>SEO Bilgileri</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="seo_baslik">SEO Başlık</Label>
          <Input
            id="seo_baslik"
            value={formData.seo_baslik || ""}
            onChange={(e) => onChange("seo_baslik", e.target.value)}
            placeholder="SEO için başlık (70 karakter önerilir)"
            maxLength={100}
          />
          {errors.seo_baslik && <p className="text-sm text-red-500">{errors.seo_baslik}</p>}
          <p className="text-xs text-muted-foreground">Karakter sayısı: {formData.seo_baslik?.length || 0}/100</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seo_aciklama">SEO Açıklama</Label>
          <Textarea
            id="seo_aciklama"
            value={formData.seo_aciklama || ""}
            onChange={(e) => onChange("seo_aciklama", e.target.value)}
            placeholder="SEO için açıklama (160 karakter önerilir)"
            maxLength={250}
          />
          {errors.seo_aciklama && <p className="text-sm text-red-500">{errors.seo_aciklama}</p>}
          <p className="text-xs text-muted-foreground">Karakter sayısı: {formData.seo_aciklama?.length || 0}/250</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seo_anahtar_kelimeler">Anahtar Kelimeler</Label>
          <Input
            id="seo_anahtar_kelimeler"
            value={formData.seo_anahtar_kelimeler || ""}
            onChange={(e) => onChange("seo_anahtar_kelimeler", e.target.value)}
            placeholder="Anahtar kelimeleri virgülle ayırarak yazın"
          />
          {errors.seo_anahtar_kelimeler && <p className="text-sm text-red-500">{errors.seo_anahtar_kelimeler}</p>}
          <p className="text-xs text-muted-foreground">Örnek: restoran, kafe, istanbul, yemek</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seo_canonical">Canonical URL (İsteğe Bağlı)</Label>
          <Input
            id="seo_canonical"
            value={formData.seo_canonical || ""}
            onChange={(e) => onChange("seo_canonical", e.target.value)}
            placeholder="https://example.com/sayfa"
          />
          {errors.seo_canonical && <p className="text-sm text-red-500">{errors.seo_canonical}</p>}
          <p className="text-xs text-muted-foreground">
            Bu alan genellikle boş bırakılabilir. Sadece içerik tekrarı durumunda doldurun.
          </p>
        </div>
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <h4 className="font-medium mb-2">SEO Önizleme</h4>
        <div className="space-y-1">
          <p className="text-blue-600 text-lg font-medium truncate">
            {formData.seo_baslik || formData.isletme_adi || "İşletme Başlığı"}
          </p>
          <p className="text-green-700 text-sm">
            {`www.example.com/${formData.url_slug || slugify(formData.isletme_adi) || "isletme-adi"}`}
          </p>
          <p className="text-sm text-gray-600 line-clamp-2">
            {formData.seo_aciklama || formData.aciklama || "İşletme açıklaması burada görünecek..."}
          </p>
        </div>
      </div>
    </div>
  )
}

// URL slug oluşturma yardımcı fonksiyonu
function slugify(text = ""): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Boşlukları tire ile değiştir
    .replace(/[^\w-]+/g, "") // Alfanümerik olmayan karakterleri kaldır
    .replace(/--+/g, "-") // Birden fazla tireyi tek tire ile değiştir
    .replace(/^-+/, "") // Baştaki tireleri kaldır
    .replace(/-+$/, "") // Sondaki tireleri kaldır
}
