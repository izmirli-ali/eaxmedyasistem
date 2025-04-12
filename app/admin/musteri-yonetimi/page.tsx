"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Search, Edit, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

export default function MusteriYonetimi() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [musteriler, setMusteriler] = useState([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedMusteri, setSelectedMusteri] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredMusteriler, setFilteredMusteriler] = useState([])
  const [formData, setFormData] = useState({
    isletme_adi: "",
    yetkili_kisi: "",
    telefon: "",
    email: "",
    adres: "",
    sehir: "",
    odeme_durumu: "beklemede",
    sozlesme_baslangic: "",
    sozlesme_bitis: "",
    notlar: "",
    odeme_tutari: "",
  })

  // Supabase istemcisini oluştur
  const supabase = createClient()

  // Müşterileri yükle
  useEffect(() => {
    async function loadMusteriler() {
      try {
        setLoading(true)

        // Müşterileri getir
        const { data, error } = await supabase.from("musteriler").select("*").order("created_at", { ascending: false })

        if (error) throw error

        setMusteriler(data || [])
        setFilteredMusteriler(data || [])
      } catch (error) {
        console.error("Müşteriler yüklenirken hata:", error)
        toast({
          title: "Hata",
          description: "Müşteriler yüklenirken bir hata oluştu.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadMusteriler()
  }, [supabase, toast])

  // Arama işlevi
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredMusteriler(musteriler)
    } else {
      const lowercasedSearch = searchTerm.toLowerCase()
      const filtered = musteriler.filter(
        (musteri) =>
          musteri.isletme_adi?.toLowerCase().includes(lowercasedSearch) ||
          musteri.yetkili_kisi?.toLowerCase().includes(lowercasedSearch) ||
          musteri.sehir?.toLowerCase().includes(lowercasedSearch),
      )
      setFilteredMusteriler(filtered)
    }
  }, [searchTerm, musteriler])

  // Form değişikliklerini işle
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Select değişikliklerini işle
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Müşteri ekle
  const handleAddMusteri = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)

      // Müşteri ekle
      const { data, error } = await supabase.from("musteriler").insert([
        {
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])

      if (error) throw error

      // Müşterileri yeniden yükle
      const { data: updatedMusteriler, error: loadError } = await supabase
        .from("musteriler")
        .select("*")
        .order("created_at", { ascending: false })

      if (loadError) throw loadError

      setMusteriler(updatedMusteriler || [])
      setFilteredMusteriler(updatedMusteriler || [])

      toast({
        title: "Başarılı",
        description: "Müşteri başarıyla eklendi.",
      })

      // Formu sıfırla ve dialogu kapat
      setFormData({
        isletme_adi: "",
        yetkili_kisi: "",
        telefon: "",
        email: "",
        adres: "",
        sehir: "",
        odeme_durumu: "beklemede",
        sozlesme_baslangic: "",
        sozlesme_bitis: "",
        notlar: "",
        odeme_tutari: "",
      })
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Müşteri eklenirken hata:", error)
      toast({
        title: "Hata",
        description: error.message || "Müşteri eklenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Müşteri düzenleme için dialogu aç
  const openEditDialog = (musteri) => {
    setSelectedMusteri(musteri)
    setFormData({
      isletme_adi: musteri.isletme_adi || "",
      yetkili_kisi: musteri.yetkili_kisi || "",
      telefon: musteri.telefon || "",
      email: musteri.email || "",
      adres: musteri.adres || "",
      sehir: musteri.sehir || "",
      odeme_durumu: musteri.odeme_durumu || "beklemede",
      sozlesme_baslangic: musteri.sozlesme_baslangic || "",
      sozlesme_bitis: musteri.sozlesme_bitis || "",
      notlar: musteri.notlar || "",
      odeme_tutari: musteri.odeme_tutari || "",
    })
    setIsEditDialogOpen(true)
  }

  // Müşteri düzenle
  const handleEditMusteri = async (e) => {
    e.preventDefault()

    if (!selectedMusteri) return

    try {
      setLoading(true)

      // Müşteri güncelle
      const { error } = await supabase
        .from("musteriler")
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedMusteri.id)

      if (error) throw error

      // Müşterileri yeniden yükle
      const { data: updatedMusteriler, error: loadError } = await supabase
        .from("musteriler")
        .select("*")
        .order("created_at", { ascending: false })

      if (loadError) throw loadError

      setMusteriler(updatedMusteriler || [])
      setFilteredMusteriler(updatedMusteriler || [])

      toast({
        title: "Başarılı",
        description: "Müşteri başarıyla güncellendi.",
      })

      // Formu sıfırla ve dialogu kapat
      setSelectedMusteri(null)
      setFormData({
        isletme_adi: "",
        yetkili_kisi: "",
        telefon: "",
        email: "",
        adres: "",
        sehir: "",
        odeme_durumu: "beklemede",
        sozlesme_baslangic: "",
        sozlesme_bitis: "",
        notlar: "",
        odeme_tutari: "",
      })
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Müşteri güncellenirken hata:", error)
      toast({
        title: "Hata",
        description: error.message || "Müşteri güncellenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Müşteri silme için dialogu aç
  const openDeleteDialog = (musteri) => {
    setSelectedMusteri(musteri)
    setIsDeleteDialogOpen(true)
  }

  // Müşteri sil
  const handleDeleteMusteri = async () => {
    if (!selectedMusteri) return

    try {
      setLoading(true)

      // Müşteri sil
      const { error } = await supabase.from("musteriler").delete().eq("id", selectedMusteri.id)

      if (error) throw error

      // Müşterileri yeniden yükle
      const { data: updatedMusteriler, error: loadError } = await supabase
        .from("musteriler")
        .select("*")
        .order("created_at", { ascending: false })

      if (loadError) throw loadError

      setMusteriler(updatedMusteriler || [])
      setFilteredMusteriler(updatedMusteriler || [])

      toast({
        title: "Başarılı",
        description: "Müşteri başarıyla silindi.",
      })

      // Seçili müşteriyi sıfırla ve dialogu kapat
      setSelectedMusteri(null)
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Müşteri silinirken hata:", error)
      toast({
        title: "Hata",
        description: error.message || "Müşteri silinirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Ödeme durumuna göre badge rengi
  const getOdemeDurumuBadge = (durum) => {
    switch (durum) {
      case "odendi":
        return <Badge className="bg-green-100 text-green-800">Ödendi</Badge>
      case "beklemede":
        return <Badge className="bg-yellow-100 text-yellow-800">Beklemede</Badge>
      case "iptal":
        return <Badge className="bg-red-100 text-red-800">İptal</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{durum}</Badge>
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ödeme Yönetimi</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Ödeme Ekle
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>İşletme Ödemeleri</CardTitle>
          <CardDescription>Sistemdeki tüm işletme ödemelerini görüntüleyin ve yönetin.</CardDescription>
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Müşteri adı, yetkili kişi veya şehir ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && musteriler.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>İşletme Adı</TableHead>
                    <TableHead>Yetkili Kişi</TableHead>
                    <TableHead>Şehir</TableHead>
                    <TableHead>Ödeme Durumu</TableHead>
                    <TableHead>Sözleşme Bitiş</TableHead>
                    <TableHead>Ödeme Tutarı</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMusteriler.length > 0 ? (
                    filteredMusteriler.map((musteri) => (
                      <TableRow key={musteri.id}>
                        <TableCell className="font-medium">{musteri.isletme_adi}</TableCell>
                        <TableCell>{musteri.yetkili_kisi}</TableCell>
                        <TableCell>{musteri.sehir}</TableCell>
                        <TableCell>{getOdemeDurumuBadge(musteri.odeme_durumu)}</TableCell>
                        <TableCell>
                          {musteri.sozlesme_bitis &&
                            format(new Date(musteri.sozlesme_bitis), "dd MMMM yyyy", { locale: tr })}
                        </TableCell>
                        <TableCell>{musteri.odeme_tutari ? `${musteri.odeme_tutari} ₺` : "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(musteri)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(musteri)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        {searchTerm ? "Arama kriterlerine uygun müşteri bulunamadı" : "Henüz müşteri bulunmuyor"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Müşteri Ekleme Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Yeni Ödeme Ekle</DialogTitle>
            <DialogDescription>Sisteme yeni bir ödeme eklemek için aşağıdaki formu doldurun.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMusteri}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="isletme_adi">İşletme Adı</Label>
                <Input
                  id="isletme_adi"
                  name="isletme_adi"
                  value={formData.isletme_adi}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yetkili_kisi">Yetkili Kişi</Label>
                <Input
                  id="yetkili_kisi"
                  name="yetkili_kisi"
                  value={formData.yetkili_kisi}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefon">Telefon</Label>
                <Input id="telefon" name="telefon" value={formData.telefon} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sehir">Şehir</Label>
                <Input id="sehir" name="sehir" value={formData.sehir} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="odeme_durumu">Ödeme Durumu</Label>
                <Select
                  value={formData.odeme_durumu}
                  onValueChange={(value) => handleSelectChange("odeme_durumu", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ödeme durumu seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beklemede">Beklemede</SelectItem>
                    <SelectItem value="odendi">Ödendi</SelectItem>
                    <SelectItem value="iptal">İptal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sozlesme_baslangic">Sözleşme Başlangıç Tarihi</Label>
                <Input
                  id="sozlesme_baslangic"
                  name="sozlesme_baslangic"
                  type="date"
                  value={formData.sozlesme_baslangic}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sozlesme_bitis">Sözleşme Bitiş Tarihi</Label>
                <Input
                  id="sozlesme_bitis"
                  name="sozlesme_bitis"
                  type="date"
                  value={formData.sozlesme_bitis}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="odeme_tutari">Ödeme Tutarı (₺)</Label>
                <Input
                  id="odeme_tutari"
                  name="odeme_tutari"
                  type="number"
                  value={formData.odeme_tutari}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="adres">Adres</Label>
                <Textarea id="adres" name="adres" value={formData.adres} onChange={handleChange} rows={2} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notlar">Notlar</Label>
                <Textarea id="notlar" name="notlar" value={formData.notlar} onChange={handleChange} rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                İptal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ekleniyor...
                  </>
                ) : (
                  "Ekle"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Müşteri Düzenleme Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ödeme Düzenle</DialogTitle>
            <DialogDescription>Ödeme bilgilerini güncellemek için aşağıdaki formu doldurun.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditMusteri}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="isletme_adi">İşletme Adı</Label>
                <Input
                  id="isletme_adi"
                  name="isletme_adi"
                  value={formData.isletme_adi}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yetkili_kisi">Yetkili Kişi</Label>
                <Input
                  id="yetkili_kisi"
                  name="yetkili_kisi"
                  value={formData.yetkili_kisi}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefon">Telefon</Label>
                <Input id="telefon" name="telefon" value={formData.telefon} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sehir">Şehir</Label>
                <Input id="sehir" name="sehir" value={formData.sehir} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="odeme_durumu">Ödeme Durumu</Label>
                <Select
                  value={formData.odeme_durumu}
                  onValueChange={(value) => handleSelectChange("odeme_durumu", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ödeme durumu seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beklemede">Beklemede</SelectItem>
                    <SelectItem value="odendi">Ödendi</SelectItem>
                    <SelectItem value="iptal">İptal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sozlesme_baslangic">Sözleşme Başlangıç Tarihi</Label>
                <Input
                  id="sozlesme_baslangic"
                  name="sozlesme_baslangic"
                  type="date"
                  value={formData.sozlesme_baslangic}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sozlesme_bitis">Sözleşme Bitiş Tarihi</Label>
                <Input
                  id="sozlesme_bitis"
                  name="sozlesme_bitis"
                  type="date"
                  value={formData.sozlesme_bitis}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="odeme_tutari">Ödeme Tutarı (₺)</Label>
                <Input
                  id="odeme_tutari"
                  name="odeme_tutari"
                  type="number"
                  value={formData.odeme_tutari}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="adres">Adres</Label>
                <Textarea id="adres" name="adres" value={formData.adres} onChange={handleChange} rows={2} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notlar">Notlar</Label>
                <Textarea id="notlar" name="notlar" value={formData.notlar} onChange={handleChange} rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                İptal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Güncelleniyor...
                  </>
                ) : (
                  "Güncelle"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Müşteri Silme Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ödeme Sil</DialogTitle>
            <DialogDescription>
              Bu ödemeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500">
              <strong>{selectedMusteri?.isletme_adi}</strong> müşterisini silmek üzeresiniz.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              İptal
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteMusteri} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Siliniyor...
                </>
              ) : (
                "Sil"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
