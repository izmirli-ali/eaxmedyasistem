"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/supabase"
import type { Application } from "@/types"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function OnBasvurular() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("on_basvurular").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setApplications(data || [])
    } catch (error) {
      console.error("Başvuru verileri alınamadı:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application)
    setIsDetailsOpen(true)
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("on_basvurular")
        .update({
          durum: status,
          islem_tarihi: new Date().toISOString(),
          islem_yapan_kullanici_id: "admin", // Gerçek kullanıcı ID'si ile değiştirilmeli
        })
        .eq("id", id)

      if (error) throw error

      fetchApplications()
      setIsDetailsOpen(false)
    } catch (error) {
      console.error("Başvuru durumu güncellenirken hata oluştu:", error)
    }
  }

  const handleDeleteApplication = async (id: string) => {
    if (!confirm("Bu başvuruyu silmek istediğinizden emin misiniz?")) return

    try {
      const { error } = await supabase.from("on_basvurular").delete().eq("id", id)

      if (error) throw error

      fetchApplications()
    } catch (error) {
      console.error("Başvuru silinirken hata oluştu:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "onaylandı":
        return <Badge variant="success">Onaylandı</Badge>
      case "reddedildi":
        return <Badge variant="destructive">Reddedildi</Badge>
      case "beklemede":
      default:
        return <Badge variant="outline">Beklemede</Badge>
    }
  }

  const filteredApplications = applications.filter((application) => {
    const matchesSearch =
      application.isletme_adi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.yetkili_adi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.yetkili_soyadi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === null || application.durum === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ön Başvurular</CardTitle>
          <div className="flex space-x-2">
            <Input
              placeholder="Başvuru ara..."
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
              <option value="beklemede">Beklemede</option>
              <option value="onaylandı">Onaylandı</option>
              <option value="reddedildi">Reddedildi</option>
            </select>
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
                  <TableHead>Yetkili</TableHead>
                  <TableHead>İletişim</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Başvuru bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>{application.isletme_adi}</TableCell>
                      <TableCell>
                        {application.yetkili_adi} {application.yetkili_soyadi}
                      </TableCell>
                      <TableCell>
                        <div>{application.email}</div>
                        <div>{application.telefon}</div>
                      </TableCell>
                      <TableCell>{new Date(application.created_at || "").toLocaleDateString("tr-TR")}</TableCell>
                      <TableCell>{getStatusBadge(application.durum || "beklemede")}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(application)}>
                            Detaylar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteApplication(application.id)}
                          >
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

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Başvuru Detayları</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">İşletme Adı</h3>
                  <p>{selectedApplication.isletme_adi}</p>
                </div>
                <div>
                  <h3 className="font-medium">Kategori</h3>
                  <p>{selectedApplication.kategori || "-"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Yetkili</h3>
                  <p>
                    {selectedApplication.yetkili_adi} {selectedApplication.yetkili_soyadi}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">İletişim</h3>
                  <p>{selectedApplication.email}</p>
                  <p>{selectedApplication.telefon}</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium">Adres</h3>
                <p>{selectedApplication.adres || "-"}</p>
                <p>
                  {selectedApplication.ilce} {selectedApplication.sehir}
                </p>
              </div>
              <div>
                <h3 className="font-medium">Mesaj</h3>
                <p className="whitespace-pre-wrap">{selectedApplication.mesaj || "-"}</p>
              </div>
              <div>
                <h3 className="font-medium">Başvuru Tarihi</h3>
                <p>{new Date(selectedApplication.created_at || "").toLocaleString("tr-TR")}</p>
              </div>
              <div>
                <h3 className="font-medium">Durum</h3>
                <p>{getStatusBadge(selectedApplication.durum || "beklemede")}</p>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                  Kapat
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleUpdateStatus(selectedApplication.id, "reddedildi")}
                  disabled={selectedApplication.durum === "reddedildi"}
                >
                  Reddet
                </Button>
                <Button
                  variant="default"
                  onClick={() => handleUpdateStatus(selectedApplication.id, "onaylandı")}
                  disabled={selectedApplication.durum === "onaylandı"}
                >
                  Onayla
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
