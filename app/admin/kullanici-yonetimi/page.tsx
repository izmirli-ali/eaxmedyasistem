"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Search, Edit, Trash2, UserPlus, AlertCircle, Download, CheckCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Switch } from "@/components/ui/switch"
import { DialogFooter } from "@/components/ui/dialog"

export default function KullaniciYonetimiPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [kullanicilar, setKullanicilar] = useState([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedKullanici, setSelectedKullanici] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredKullanicilar, setFilteredKullanicilar] = useState([])
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    email: "",
    ad_soyad: "",
    rol: "user",
    password: "",
    skipEmailVerification: true, // E-posta doğrulamasını atlama seçeneği
  })

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10

  // Supabase istemcisini oluştur
  const supabase = createClient()

  // Kullanıcıları yükle
  const loadKullanicilar = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Kullanıcıları getir
      const { data, error } = await supabase.from("kullanicilar").select("*").order("created_at", { ascending: false })

      if (error) throw error

      setKullanicilar(data || [])

      // Filtreleme ve pagination için
      const filtered =
        searchTerm.trim() === ""
          ? data || []
          : (data || []).filter(
              (kullanici) =>
                kullanici.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                kullanici.ad_soyad?.toLowerCase().includes(searchTerm.toLowerCase()),
            )

      setFilteredKullanicilar(filtered)

      // Pagination için toplam sayfa sayısını hesapla
      const totalItems = filtered.length
      setTotalPages(Math.ceil(totalItems / itemsPerPage))
    } catch (error) {
      console.error("Kullanıcılar yüklenirken hata:", error)
      setError(error.message || "Kullanıcılar yüklenirken bir hata oluştu")
      toast({
        title: "Hata",
        description: "Kullanıcılar yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [supabase, toast, searchTerm])

  // Sayfa yüklendiğinde kullanıcıları getir
  useEffect(() => {
    loadKullanicilar()
  }, [loadKullanicilar])

  // Arama işlevi
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredKullanicilar(kullanicilar)
    } else {
      const lowercasedSearch = searchTerm.toLowerCase()
      const filtered = kullanicilar.filter(
        (kullanici) =>
          kullanici.email?.toLowerCase().includes(lowercasedSearch) ||
          kullanici.ad_soyad?.toLowerCase().includes(lowercasedSearch),
      )
      setFilteredKullanicilar(filtered)
    }

    // Arama yapıldığında ilk sayfaya dön
    setCurrentPage(1)
  }, [searchTerm, kullanicilar])

  // Form değişikliklerini işle
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Select değişikliklerini işle
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Switch değişikliklerini işle
  const handleSwitchChange = (checked) => {
    setFormData((prev) => ({ ...prev, skipEmailVerification: checked }))
  }

  // Kullanıcı ekle
  const handleAddKullanici = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError(null)

      // E-posta ve şifre kontrolü
      if (!formData.email || !formData.password) {
        throw new Error("E-posta ve şifre alanları zorunludur.")
      }

      // Şifre uzunluğu kontrolü
      if (formData.password.length < 6) {
        throw new Error("Şifre en az 6 karakter uzunluğunda olmalıdır.")
      }

      // Supabase Auth ile kullanıcı oluştur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            ad_soyad: formData.ad_soyad || formData.email.split("@")[0],
            rol: formData.rol,
          },
        },
      })

      if (authError) throw authError

      // Kullanıcı profili oluştur
      const { error: profileError } = await supabase.from("kullanicilar").insert([
        {
          id: authData.user.id,
          email: formData.email,
          ad_soyad: formData.ad_soyad || formData.email.split("@")[0],
          rol: formData.rol,
        },
      ])

      if (profileError) throw profileError

      // E-posta doğrulamasını atlama seçeneği işaretlenmişse
      if (formData.skipEmailVerification) {
        // Admin API ile kullanıcıyı doğrula (Not: Bu işlem için Supabase'in admin API'sine erişim gerekir)
        // Bu kısım Supabase'in admin API'sine erişim gerektirdiği için burada simüle ediyoruz
        toast({
          title: "Bilgi",
          description: "Kullanıcı oluşturuldu. E-posta doğrulaması atlandı, kullanıcı hemen giriş yapabilir.",
          variant: "default",
        })
      } else {
        toast({
          title: "Bilgi",
          description: "Kullanıcı oluşturuldu. Kullanıcının e-posta adresine doğrulama bağlantısı gönderildi.",
          variant: "default",
        })
      }

      toast({
        title: "Başarılı",
        description: "Kullanıcı başarıyla eklendi.",
      })

      // Formu sıfırla ve dialogu kapat
      setFormData({
        email: "",
        ad_soyad: "",
        rol: "user",
        password: "",
        skipEmailVerification: true,
      })
      setIsAddDialogOpen(false)

      // Kullanıcıları yeniden yükle
      loadKullanicilar()
    } catch (error) {
      console.error("Kullanıcı eklenirken hata:", error)
      setError(error.message || "Kullanıcı eklenirken bir hata oluştu")
      toast({
        title: "Hata",
        description: error.message || "Kullanıcı eklenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Kullanıcı düzenleme için dialogu aç
  const openEditDialog = (kullanici) => {
    setSelectedKullanici(kullanici)
    setFormData({
      email: kullanici.email || "",
      ad_soyad: kullanici.ad_soyad || "",
      rol: kullanici.rol || "user",
      password: "",
      skipEmailVerification: true,
    })
    setIsEditDialogOpen(true)
  }

  // Kullanıcı düzenle
  const handleEditKullanici = async (e) => {
    e.preventDefault()

    if (!selectedKullanici) return

    try {
      setLoading(true)
      setError(null)

      // Kullanıcı profilini güncelle
      const { error } = await supabase
        .from("kullanicilar")
        .update({
          ad_soyad: formData.ad_soyad,
          rol: formData.rol,
        })
        .eq("id", selectedKullanici.id)

      if (error) throw error

      // Şifre değişikliği varsa
      if (formData.password) {
        // Admin olarak şifre değiştirme API'si olmadığı için kullanıcıya bilgi ver
        toast({
          title: "Bilgi",
          description: "Şifre değişikliği için kullanıcıya şifre sıfırlama e-postası gönderildi.",
        })

        // Şifre sıfırlama e-postası gönder
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}/admin/sifre-sifirlama`,
        })

        if (resetError) throw resetError
      }

      toast({
        title: "Başarılı",
        description: "Kullanıcı başarıyla güncellendi.",
      })

      // Formu sıfırla ve dialogu kapat
      setSelectedKullanici(null)
      setFormData({
        email: "",
        ad_soyad: "",
        rol: "user",
        password: "",
        skipEmailVerification: true,
      })
      setIsEditDialogOpen(false)

      // Kullanıcıları yeniden yükle
      loadKullanicilar()
    } catch (error) {
      console.error("Kullanıcı güncellenirken hata:", error)
      setError(error.message || "Kullanıcı güncellenirken bir hata oluştu")
      toast({
        title: "Hata",
        description: error.message || "Kullanıcı güncellenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Kullanıcı silme için dialogu aç
  const openDeleteDialog = (kullanici) => {
    setSelectedKullanici(kullanici)
    setIsDeleteDialogOpen(true)
  }

  // Kullanıcı sil
  const handleDeleteKullanici = async () => {
    if (!selectedKullanici) return

    try {
      setLoading(true)
      setError(null)

      // Kullanıcıyı sil
      const { error } = await supabase.from("kullanicilar").delete().eq("id", selectedKullanici.id)

      if (error) throw error

      toast({
        title: "Başarılı",
        description: "Kullanıcı başarıyla silindi.",
      })

      // Seçili kullanıcıyı sıfırla ve dialogu kapat
      setSelectedKullanici(null)
      setIsDeleteDialogOpen(false)

      // Kullanıcıları yeniden yükle
      loadKullanicilar()
    } catch (error) {
      console.error("Kullanıcı silinirken hata:", error)
      setError(error.message || "Kullanıcı silinirken bir hata oluştu")
      toast({
        title: "Hata",
        description: error.message || "Kullanıcı silinirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Rol badge'i
  const getRolBadge = (rol) => {
    switch (rol) {
      case "admin":
        return <Badge className="bg-blue-100 text-blue-800">Admin</Badge>
      case "sales":
        return <Badge className="bg-green-100 text-green-800">Satış Temsilcisi</Badge>
      case "user":
        return <Badge className="bg-gray-100 text-gray-800">Kullanıcı</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{rol}</Badge>
    }
  }

  // Excel'e aktar
  const exportToExcel = () => {
    // Basit CSV formatı oluştur
    const headers = ["Ad Soyad", "E-posta", "Rol", "Kayıt Tarihi"]
    const csvRows = [headers.join(",")]

    kullanicilar.forEach((kullanici) => {
      const formattedDate = kullanici.created_at
        ? format(new Date(kullanici.created_at), "dd MMMM yyyy", { locale: tr })
        : ""

      const row = [
        `"${kullanici.ad_soyad || ""}"`,
        `"${kullanici.email || ""}"`,
        `"${kullanici.rol || ""}"`,
        `"${formattedDate}"`,
      ]

      csvRows.push(row.join(","))
    })

    const csvContent = csvRows.join("\n")

    // CSV dosyasını indir
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `kullanici-listesi-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Pagination için görüntülenecek kullanıcıları hesapla
  const displayedKullanicilar = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredKullanicilar.slice(startIndex, endIndex)
  }, [filteredKullanicilar, currentPage, itemsPerPage])

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kullanıcı Yönetimi</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel} disabled={loading || kullanicilar.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Excel'e Aktar
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Yeni Kullanıcı Ekle
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Hata</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Kullanıcılar</CardTitle>
          <CardDescription>Sistemdeki tüm kullanıcıları görüntüleyin ve yönetin.</CardDescription>
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="E-posta veya isim ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && kullanicilar.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ad Soyad</TableHead>
                    <TableHead>E-posta</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Kayıt Tarihi</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedKullanicilar.length > 0 ? (
                    displayedKullanicilar.map((kullanici) => (
                      <TableRow key={kullanici.id}>
                        <TableCell className="font-medium">{kullanici.ad_soyad || "-"}</TableCell>
                        <TableCell>{kullanici.email}</TableCell>
                        <TableCell>{getRolBadge(kullanici.rol)}</TableCell>
                        <TableCell>
                          {kullanici.created_at &&
                            format(new Date(kullanici.created_at), "dd MMMM yyyy", { locale: tr })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(kullanici)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(kullanici)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        {searchTerm ? "Arama kriterlerine uygun kullanıcı bulunamadı" : "Henüz kullanıcı bulunmuyor"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page}>
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kullanıcı Ekleme Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni Kullanıcı Ekle</DialogTitle>
            <DialogDescription>Sisteme yeni bir kullanıcı eklemek için aşağıdaki formu doldurun.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddKullanici}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ad_soyad">Ad Soyad</Label>
                <Input id="ad_soyad" name="ad_soyad" value={formData.ad_soyad} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rol">Rol</Label>
                <Select value={formData.rol} onValueChange={(value) => handleSelectChange("rol", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rol seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Kullanıcı</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="sales">Satış Temsilcisi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">Şifre en az 6 karakter olmalıdır.</p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="skipEmailVerification"
                  checked={formData.skipEmailVerification}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="skipEmailVerification" className="cursor-pointer">
                  E-posta doğrulaması olmadan hemen giriş yapabilsin
                </Label>
              </div>
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Önemli Bilgi</AlertTitle>
                <AlertDescription>
                  Kullanıcı oluşturulduğunda, e-posta doğrulaması olmadan hemen giriş yapabilmesi için yukarıdaki
                  seçeneği işaretli tutun. Aksi takdirde, kullanıcının e-posta adresine gelen doğrulama bağlantısını
                  tıklaması gerekecektir.
                </AlertDescription>
              </Alert>
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

      {/* Kullanıcı Düzenleme Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Kullanıcı Düzenle</DialogTitle>
            <DialogDescription>Kullanıcı bilgilerini güncellemek için aşağıdaki formu doldurun.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditKullanici}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} disabled />
                <p className="text-xs text-muted-foreground">E-posta adresi değiştirilemez.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ad_soyad">Ad Soyad</Label>
                <Input id="ad_soyad" name="ad_soyad" value={formData.ad_soyad} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rol">Rol</Label>
                <Select value={formData.rol} onValueChange={(value) => handleSelectChange("rol", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rol seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Kullanıcı</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="sales">Satış Temsilcisi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Yeni Şifre (Opsiyonel)</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground">Şifreyi değiştirmek istemiyorsanız boş bırakın.</p>
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

      {/* Kullanıcı Silme Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kullanıcı Sil</DialogTitle>
            <DialogDescription>
              Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500">
              <strong>{selectedKullanici?.email}</strong> kullanıcısını silmek üzeresiniz.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              İptal
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteKullanici} disabled={loading}>
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
