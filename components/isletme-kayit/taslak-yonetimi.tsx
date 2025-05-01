"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Trash2, Download, Upload, Clock, Edit, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface TaslakYonetimiProps {
  formData: any
  setFormData: (data: any) => void
  isTableChecked: boolean
}

interface Taslak {
  id: string
  user_id: string
  form_data: any
  taslak_adi: string
  updated_at: string
  created_at: string
}

export function TaslakYonetimi({ formData, setFormData, isTableChecked }: TaslakYonetimiProps) {
  const [taslaklar, setTaslaklar] = useState<Taslak[]>([])
  const [loading, setLoading] = useState(false)
  const [taslakAdi, setTaslakAdi] = useState("")
  const [seciliTaslak, setSeciliTaslak] = useState<Taslak | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  // Taslakları yükle
  const taslakYukle = async () => {
    if (!isTableChecked) return

    setLoading(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) return

      const { data, error } = await supabase
        .from("isletme_taslaklari")
        .select("*")
        .eq("user_id", sessionData.session.user.id)
        .order("updated_at", { ascending: false })

      if (error) throw error

      setTaslaklar(data || [])
    } catch (error) {
      console.error("Taslaklar yüklenirken hata:", error)
      toast({
        title: "Hata",
        description: "Taslaklar yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Sayfa yüklendiğinde taslakları getir
  useEffect(() => {
    if (isTableChecked) {
      taslakYukle()
    }
  }, [isTableChecked])

  // Taslak kaydet
  const taslakKaydet = async () => {
    if (!isTableChecked) {
      toast({
        title: "Uyarı",
        description: "Taslak tablosu henüz oluşturulmamış. Lütfen önce tabloyu oluşturun.",
        variant: "warning",
      })
      return
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        toast({
          title: "Oturum hatası",
          description: "Taslak kaydetmek için oturum açmanız gerekiyor.",
          variant: "destructive",
        })
        return
      }

      const yeniTaslakAdi = taslakAdi.trim() || `Taslak ${new Date().toLocaleString()}`

      const { data, error } = await supabase
        .from("isletme_taslaklari")
        .insert({
          user_id: sessionData.session.user.id,
          form_data: formData,
          taslak_adi: yeniTaslakAdi,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (error) throw error

      toast({
        title: "Başarılı",
        description: "Taslak başarıyla kaydedildi.",
      })

      setTaslakAdi("")
      taslakYukle()
      setShowDialog(false)
    } catch (error) {
      console.error("Taslak kaydedilirken hata:", error)
      toast({
        title: "Hata",
        description: "Taslak kaydedilirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  // Taslak sil
  const taslakSil = async (id: string) => {
    if (!confirm("Bu taslağı silmek istediğinize emin misiniz?")) return

    try {
      const { error } = await supabase.from("isletme_taslaklari").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Başarılı",
        description: "Taslak başarıyla silindi.",
      })

      taslakYukle()
    } catch (error) {
      console.error("Taslak silinirken hata:", error)
      toast({
        title: "Hata",
        description: "Taslak silinirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  // Taslak yükle
  const taslakYukleVeUygula = (taslak: Taslak) => {
    setFormData(taslak.form_data)
    setSeciliTaslak(taslak)

    toast({
      title: "Taslak yüklendi",
      description: `"${taslak.taslak_adi}" taslağı başarıyla yüklendi.`,
    })
  }

  // Taslak indir
  const taslakIndir = () => {
    const dataStr = JSON.stringify(formData, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `isletme-taslak-${new Date().toISOString()}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  // Taslak yükle (dosyadan)
  const taslakDosyaYukle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string)
        setFormData(json)

        toast({
          title: "Taslak yüklendi",
          description: "Taslak dosyadan başarıyla yüklendi.",
        })
      } catch (error) {
        console.error("Taslak dosyası okunurken hata:", error)
        toast({
          title: "Hata",
          description: "Taslak dosyası okunurken bir hata oluştu. Lütfen geçerli bir taslak dosyası seçin.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Taslak Yönetimi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Yeni Taslak
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Taslak Kaydet</DialogTitle>
                <DialogDescription>Mevcut form verilerini yeni bir taslak olarak kaydedin.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="taslak-adi">Taslak Adı</Label>
                  <Input
                    id="taslak-adi"
                    placeholder="Taslak adı girin"
                    value={taslakAdi}
                    onChange={(e) => setTaslakAdi(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  İptal
                </Button>
                <Button onClick={taslakKaydet}>Kaydet</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={taslakIndir}>
            <Download className="h-4 w-4 mr-1" />
            Taslak İndir
          </Button>

          <div className="relative">
            <Input type="file" accept=".json" className="hidden" id="taslak-yukle" onChange={taslakDosyaYukle} />
            <Button variant="outline" size="sm" onClick={() => document.getElementById("taslak-yukle")?.click()}>
              <Upload className="h-4 w-4 mr-1" />
              Taslak Yükle
            </Button>
          </div>
        </div>

        {isTableChecked && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Kaydedilmiş Taslaklar</h4>
              <Button variant="ghost" size="sm" onClick={taslakYukle} disabled={loading}>
                <Clock className="h-4 w-4 mr-1" />
                {loading ? "Yükleniyor..." : "Yenile"}
              </Button>
            </div>

            {taslaklar.length > 0 ? (
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {taslaklar.map((taslak) => (
                    <Card key={taslak.id} className={`p-3 ${seciliTaslak?.id === taslak.id ? "border-primary" : ""}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-sm">{taslak.taslak_adi}</h5>
                          <p className="text-xs text-muted-foreground">
                            {new Date(taslak.updated_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => taslakYukleVeUygula(taslak)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => taslakSil(taslak.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground py-2">Henüz kaydedilmiş taslak bulunmuyor.</p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <p className="text-xs text-muted-foreground">
          Taslaklar, form verilerinizi kaydetmenize ve daha sonra devam etmenize olanak tanır.
        </p>
      </CardFooter>
    </Card>
  )
}
