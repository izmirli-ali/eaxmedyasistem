"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/supabase"
import type { Business } from "@/types"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import Link from "next/link"

export default function IsletmeListesi() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  useEffect(() => {
    fetchBusinesses()
  }, [])

  const fetchBusinesses = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("isletmeler2").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setBusinesses(data || [])
    } catch (error) {
      console.error("İşletme verileri alınamadı:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBusiness = async (id: string) => {
    if (!confirm("Bu işletmeyi silmek istediğinizden emin misiniz?")) return

    try {
      const { error } = await supabase.from("isletmeler2").delete().eq("id", id)

      if (error) throw error

      fetchBusinesses()
    } catch (error) {
      console.error("İşletme silinirken hata oluştu:", error)
    }
  }

  const handleToggleStatus = async (business: Business) => {
    try {
      const newStatus = business.aktif ? false : true
      const { error } = await supabase.from("isletmeler2").update({ aktif: newStatus }).eq("id", business.id)

      if (error) throw error

      fetchBusinesses()
    } catch (error) {
      console.error("İşletme durumu güncellenirken hata oluştu:", error)
    }
  }

  const handleToggleFeatured = async (business: Business) => {
    try {
      const newFeatured = business.one_cikan ? false : true
      const { error } = await supabase.from("isletmeler2").update({ one_cikan: newFeatured }).eq("id", business.id)

      if (error) throw error

      fetchBusinesses()
    } catch (error) {
      console.error("İşletme öne çıkarma durumu güncellenirken hata oluştu:", error)
    }
  }

  const filteredBusinesses = businesses.filter((business) => {
    const matchesSearch =
      business.isletme_adi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.kategori?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.sehir?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.ilce?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === null ||
      (statusFilter === "active" && business.aktif) ||
      (statusFilter === "inactive" && !business.aktif)

    return matchesSearch && matchesStatus
  })

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>İşletme Listesi</CardTitle>
          <div className="flex space-x-2">
            <Input
              placeholder="İşletme ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <select
              className="border rounded px-3 py-1"
              value={statusFilter || ""}
              onChange={(e) => setStatusFilter(e.target.value || null)}
            >
              <option value="">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
            <Link href="/admin/isletme-kayit">
              <Button>Yeni İşletme Ekle</Button>
            </Link>
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
                  <TableHead>İşletme Adı</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Konum</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Öne Çıkan</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBusinesses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      İşletme bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBusinesses.map((business) => (
                    <TableRow key={business.id}>
                      <TableCell>{business.isletme_adi}</TableCell>
                      <TableCell>{business.kategori}</TableCell>
                      <TableCell>
                        {business.sehir} {business.ilce ? `/ ${business.ilce}` : ""}
                      </TableCell>
                      <TableCell>
                        <Badge variant={business.aktif ? "success" : "destructive"}>
                          {business.aktif ? "Aktif" : "Pasif"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={business.one_cikan ? "default" : "outline"}>
                          {business.one_cikan ? "Evet" : "Hayır"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleToggleStatus(business)}>
                            {business.aktif ? "Pasif Yap" : "Aktif Yap"}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleToggleFeatured(business)}>
                            {business.one_cikan ? "Öne Çıkarma" : "Öne Çıkar"}
                          </Button>
                          <Link href={`/admin/isletme-duzenle/${business.id}`}>
                            <Button variant="outline" size="sm">
                              Düzenle
                            </Button>
                          </Link>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteBusiness(business.id)}>
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
    </div>
  )
}
