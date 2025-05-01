"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/supabase"
import type { Customer } from "@/types"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function MusteriYonetimi() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState({
    ad: "",
    soyad: "",
    email: "",
    telefon: "",
    firma_adi: "",
    adres: "",
    sehir: "",
    ulke: "",
    posta_kodu: "",
    notlar: "",
    durum: "aktif",
  })
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("musteriler").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error("Müşteri verileri alınamadı:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData({
      ad: "",
      soyad: "",
      email: "",
      telefon: "",
      firma_adi: "",
      adres: "",
      sehir: "",
      ulke: "",
      posta_kodu: "",
      notlar: "",
      durum: "aktif",
    })
  }

  const handleAddCustomer = async () => {
    try {
      const { data, error } = await supabase
        .from("musteriler")
        .insert([
          {
            ad: formData.ad,
            soyad: formData.soyad,
            email: formData.email,
            telefon: formData.telefon,
            firma_adi: formData.firma_adi,
            adres: formData.adres,
            sehir: formData.sehir,
            ulke: formData.ulke,
            posta_kodu: formData.posta_kodu,
            notlar: formData.notlar,
            durum: formData.durum,
          },
        ])
        .select()

      if (error) throw error

      setIsAddDialogOpen(false)
      resetForm()
      fetchCustomers()
    } catch (error) {
      console.error("Müşteri eklenirken hata oluştu:", error)
    }
  }

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setFormData({
      ad: customer.ad || "",
      soyad: customer.soyad || "",
      email: customer.email || "",
      telefon: customer.telefon || "",
      firma_adi: customer.firma_adi || "",
      adres: customer.adres || "",
      sehir: customer.sehir || "",
      ulke: customer.ulke || "",
      posta_kodu: customer.posta_kodu || "",
      notlar: customer.notlar || "",
      durum: customer.durum || "aktif",
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateCustomer = async () => {
    if (!selectedCustomer) return

    try {
      const { error } = await supabase
        .from("musteriler")
        .update({
          ad: formData.ad,
          soyad: formData.soyad,
          email: formData.email,
          telefon: formData.telefon,
          firma_adi: formData.firma_adi,
          adres: formData.adres,
          sehir: formData.sehir,
          ulke: formData.ulke,
          posta_kodu: formData.posta_kodu,
          notlar: formData.notlar,
          durum: formData.durum,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedCustomer.id)

      if (error) throw error

      setIsEditDialogOpen(false)
      resetForm()
      fetchCustomers()
    } catch (error) {
      console.error("Müşteri güncellenirken hata oluştu:", error)
    }
  }

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("Bu müşteriyi silmek istediğinizden emin misiniz?")) return

    try {
      const { error } = await supabase.from("musteriler").delete().eq("id", id)

      if (error) throw error

      fetchCustomers()
    } catch (error) {
      console.error("Müşteri silinirken hata oluştu:", error)
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.ad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.soyad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.firma_adi?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Müşteri Yönetimi</CardTitle>
          <div className="flex space-x-2">
            <Input
              placeholder="Müşteri ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>Yeni Müşteri Ekle</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ad">Ad</Label>
                      <Input id="ad" name="ad" value={formData.ad} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="soyad">Soyad</Label>
                      <Input id="soyad" name="soyad" value={formData.soyad} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">E-posta</Label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefon">Telefon</Label>
                      <Input id="telefon" name="telefon" value={formData.telefon} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firma_adi">Firma Adı</Label>
                    <Input id="firma_adi" name="firma_adi" value={formData.firma_adi} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adres">Adres</Label>
                    <Textarea id="adres" name="adres" value={formData.adres} onChange={handleInputChange} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sehir">Şehir</Label>
                      <Input id="sehir" name="sehir" value={formData.sehir} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ulke">Ülke</Label>
                      <Input id="ulke" name="ulke" value={formData.ulke} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="posta_kodu">Posta Kodu</Label>
                      <Input
                        id="posta_kodu"
                        name="posta_kodu"
                        value={formData.posta_kodu}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notlar">Notlar</Label>
                    <Textarea id="notlar" name="notlar" value={formData.notlar} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="durum">Durum</Label>
                    <Select value={formData.durum} onValueChange={(value) => handleSelectChange("durum", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Durum seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aktif">Aktif</SelectItem>
                        <SelectItem value="pasif">Pasif</SelectItem>
                        <SelectItem value="beklemede">Beklemede</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    İptal
                  </Button>
                  <Button onClick={handleAddCustomer}>Ekle</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad Soyad</TableHead>
                  <TableHead>E-posta</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Firma</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Müşteri bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        {customer.ad} {customer.soyad}
                      </TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.telefon}</TableCell>
                      <TableCell>{customer.firma_adi}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            customer.durum === "aktif"
                              ? "bg-green-100 text-green-800"
                              : customer.durum === "pasif"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {customer.durum === "aktif" ? "Aktif" : customer.durum === "pasif" ? "Pasif" : "Beklemede"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditCustomer(customer)}>
                            Düzenle
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteCustomer(customer.id)}>
                            Sil
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Müşteri Düzenle</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-ad">Ad</Label>
                <Input id="edit-ad" name="ad" value={formData.ad} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-soyad">Soyad</Label>
                <Input id="edit-soyad" name="soyad" value={formData.soyad} onChange={handleInputChange} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">E-posta</Label>
                <Input id="edit-email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-telefon">Telefon</Label>
                <Input id="edit-telefon" name="telefon" value={formData.telefon} onChange={handleInputChange} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-firma_adi">Firma Adı</Label>
              <Input id="edit-firma_adi" name="firma_adi" value={formData.firma_adi} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-adres">Adres</Label>
              <Textarea id="edit-adres" name="adres" value={formData.adres} onChange={handleInputChange} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-sehir">Şehir</Label>
                <Input id="edit-sehir" name="sehir" value={formData.sehir} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-ulke">Ülke</Label>
                <Input id="edit-ulke" name="ulke" value={formData.ulke} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-posta_kodu">Posta Kodu</Label>
                <Input
                  id="edit-posta_kodu"
                  name="posta_kodu"
                  value={formData.posta_kodu}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notlar">Notlar</Label>
              <Textarea id="edit-notlar" name="notlar" value={formData.notlar} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-durum">Durum</Label>
              <Select value={formData.durum} onValueChange={(value) => handleSelectChange("durum", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="pasif">Pasif</SelectItem>
                  <SelectItem value="beklemede">Beklemede</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleUpdateCustomer}>Güncelle</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
