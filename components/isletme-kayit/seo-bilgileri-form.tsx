"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Tag, Link } from "lucide-react"

interface SEOBilgileriFormProps {
  formData: any
  onChange: (field: string, value: any) => void
  errors: Record<string, string>
}

export function SEOBilgileriForm({ formData, onChange, errors }: SEOBilgileriFormProps) {
  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-0 space-y-6">
        <div className="flex items-center gap-2 text-lg font-medium text-primary">
          <Search className="h-5 w-5" />
          <h3>SEO Bilgileri</h3>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <Label htmlFor="seo_baslik">SEO Başlık</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="seo_baslik"
                value={formData.seo_baslik || ""}
                onChange={(e) => onChange("seo_baslik", e.target.value)}
                placeholder="SEO için sayfa başlığı (boş bırakılırsa işletme adı kullanılır)"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo_aciklama">SEO Açıklama</Label>
            <Textarea
              id="seo_aciklama"
              value={formData.seo_aciklama || ""}
              onChange={(e) => onChange("seo_aciklama", e.target.value)}
              placeholder="Arama motorları için kısa açıklama"
              rows={2}
            />
            <p className="text-xs text-muted-foreground">En fazla 160 karakter olmalıdır</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo_anahtar_kelimeler">SEO Anahtar Kelimeler</Label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="seo_anahtar_kelimeler"
                value={formData.seo_anahtar_kelimeler || ""}
                onChange={(e) => onChange("seo_anahtar_kelimeler", e.target.value)}
                placeholder="anahtar,kelimeler,virgülle,ayrılmış"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo_canonical">Canonical URL</Label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="seo_canonical"
                value={formData.seo_canonical || ""}
                onChange={(e) => onChange("seo_canonical", e.target.value)}
                placeholder="https://www.example.com/isletme-adi"
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">Boş bırakılırsa otomatik oluşturulur</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url_slug">URL Slug</Label>
            <Input
              id="url_slug"
              value={formData.url_slug || ""}
              onChange={(e) => onChange("url_slug", e.target.value)}
              placeholder="isletme-adi-sehir (boş bırakılırsa otomatik oluşturulur)"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
