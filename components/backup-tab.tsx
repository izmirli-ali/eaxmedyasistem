"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Download, Trash2, Database, RefreshCw, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { createClient } from "@/lib/supabase/client"
import { v4 as uuidv4 } from "uuid"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AutoBackupSchedule } from "./auto-backup-schedule"

// Tablo listesi
const availableTables = [
  { id: "isletmeler", label: "İşletmeler" },
  { id: "kullanicilar", label: "Kullanıcılar" },
  { id: "musteriler", label: "Müşteriler" },
  { id: "site_ayarlari", label: "Site Ayarları" },
]

// Yedekleme tipi
type BackupStatus = "pending" | "in_progress" | "completed" | "failed"
type BackupInfo = {
  id: string
  created_at: string
  status: BackupStatus
  file_name?: string
  file_size?: number
  tables: string[]
  error?: string
  completed_at?: string
}

export function BackupTab() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [backups, setBackups] = useState<BackupInfo[]>([])
  const [selectedTables, setSelectedTables] = useState<string[]>(["isletmeler", "kullanicilar", "musteriler"])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState<BackupInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Supabase client
  const supabase = createClient()

  // Yedeklemeleri yükle
  useEffect(() => {
    loadBackups()
  }, [])

  // Yedeklemeleri yükle
  const loadBackups = async () => {
    try {
      setLoading(true)
      setError(null)

      // Doğrudan Supabase client ile yedeklemeleri getir
      const { data, error } = await supabase.from("backups").select("*").order("created_at", { ascending: false })

      if (error) throw error

      setBackups(data || [])
    } catch (error) {
      console.error("Yedeklemeler yüklenirken hata:", error)
      setError(error.message || "Yedeklemeler yüklenirken bir hata oluştu")
      toast({
        title: "Hata",
        description: error.message || "Yedeklemeler yüklenirken bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Tablo seçimini değiştir
  const handleTableChange = (tableId: string, checked: boolean) => {
    if (checked) {
      setSelectedTables([...selectedTables, tableId])
    } else {
      setSelectedTables(selectedTables.filter((id) => id !== tableId))
    }
  }

  // Yeni yedekleme oluştur
  const handleCreateBackup = async () => {
    if (selectedTables.length === 0) {
      toast({
        title: "Uyarı",
        description: "Lütfen en az bir tablo seçin",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Yeni bir yedekleme kaydı oluştur
      const backupId = uuidv4()
      const now = new Date().toISOString()

      const newBackup = {
        id: backupId,
        created_at: now,
        status: "pending",
        tables: selectedTables,
      }

      // Yedekleme kaydını veritabanına ekle
      const { error: insertError } = await supabase.from("backups").insert([newBackup])

      if (insertError) throw insertError

      // Yedekleme işlemini başlat
      await processBackup(backupId, selectedTables)

      toast({
        title: "Başarılı",
        description: "Yedekleme işlemi başlatıldı",
      })

      setIsCreateDialogOpen(false)

      // Yedeklemeleri yeniden yükle
      loadBackups()
    } catch (error) {
      console.error("Yedekleme oluşturulurken hata:", error)
      setError(error.message || "Yedekleme oluşturulurken bir hata oluştu")
      toast({
        title: "Hata",
        description: error.message || "Yedekleme oluşturulurken bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Yedekleme işlemini gerçekleştir
  const processBackup = async (backupId: string, tables: string[]) => {
    try {
      // Yedekleme durumunu güncelle
      await supabase.from("backups").update({ status: "in_progress" }).eq("id", backupId)

      // Her tablo için veri çek
      const backupData: Record<string, any[]> = {}

      for (const table of tables) {
        const { data, error } = await supabase.from(table).select("*")

        if (error) throw error

        backupData[table] = data || []
      }

      // JSON dosyasına dönüştür
      const jsonData = JSON.stringify(backupData, null, 2)
      const fileName = `backup_${backupId}_${new Date().toISOString().replace(/:/g, "-")}.json`

      // Storage'a yükle
      const { error: uploadError } = await supabase.storage
        .from("backups")
        .upload(fileName, new Blob([jsonData], { type: "application/json" }))

      if (uploadError) throw uploadError

      // Yedekleme kaydını güncelle
      await supabase
        .from("backups")
        .update({
          status: "completed",
          file_name: fileName,
          file_size: jsonData.length,
          completed_at: new Date().toISOString(),
        })
        .eq("id", backupId)

      // Yedeklemeleri yeniden yükle
      loadBackups()
    } catch (error) {
      console.error("Yedekleme işlemi sırasında hata:", error)

      // Hata durumunda yedekleme kaydını güncelle
      await supabase
        .from("backups")
        .update({
          status: "failed",
          error: error.message || "Bilinmeyen hata",
          completed_at: new Date().toISOString(),
        })
        .eq("id", backupId)

      // Yedeklemeleri yeniden yükle
      loadBackups()
    }
  }

  // Yedekleme indir
  const handleDownloadBackup = async (backup: BackupInfo) => {
    if (!backup.file_name) {
      toast({
        title: "Hata",
        description: "Yedekleme dosyası bulunamadı",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      // İndirme URL'i oluştur
      const { data, error } = await supabase.storage.from("backups").createSignedUrl(backup.file_name, 60) // 60 saniyelik geçerli URL

      if (error) throw error

      // İndirme URL'ini aç
      window.open(data.signedUrl, "_blank")

      toast({
        title: "Başarılı",
        description: "Yedekleme indirme işlemi başlatıldı",
      })
    } catch (error) {
      console.error("Yedekleme indirme hatası:", error)
      toast({
        title: "Hata",
        description: error.message || "Yedekleme indirme hatası",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Yedekleme silme dialogunu aç
  const openDeleteDialog = (backup: BackupInfo) => {
    setSelectedBackup(backup)
    setIsDeleteDialogOpen(true)
  }

  // Yedekleme sil
  const handleDeleteBackup = async () => {
    if (!selectedBackup) {
      toast({
        title: "Hata",
        description: "Silinecek yedekleme bulunamadı",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Önce storage'dan dosyayı sil (eğer varsa)
      if (selectedBackup.file_name) {
        const { error: storageError } = await supabase.storage.from("backups").remove([selectedBackup.file_name])

        if (storageError) {
          console.warn("Dosya silinirken hata:", storageError)
          // Dosya silinmese bile devam et
        }
      }

      // Sonra veritabanından kaydı sil
      const { error: dbError } = await supabase.from("backups").delete().eq("id", selectedBackup.id)

      if (dbError) throw dbError

      toast({
        title: "Başarılı",
        description: "Yedekleme başarıyla silindi",
      })

      setIsDeleteDialogOpen(false)
      setSelectedBackup(null)

      // Yedeklemeleri yeniden yükle
      loadBackups()
    } catch (error) {
      console.error("Yedekleme silinirken hata:", error)
      setError(error.message || "Yedekleme silinirken bir hata oluştu")
      toast({
        title: "Hata",
        description: error.message || "Yedekleme silinirken bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Durum badge'i
  const getStatusBadge = (status: BackupStatus) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Bekliyor</Badge>
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800">İşleniyor</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Tamamlandı</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Başarısız</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  // Dosya boyutunu formatla
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "-"

    const units = ["B", "KB", "MB", "GB"]
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Hata</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Veri Yedekleme</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadBackups} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Yenile
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Database className="mr-2 h-4 w-4" />
            Yeni Yedekleme
          </Button>
        </div>
      </div>

      <Tabs defaultValue="manual" className="space-y-4">
        <TabsList>
          <TabsTrigger value="manual">Manuel Yedekleme</TabsTrigger>
          <TabsTrigger value="auto">Otomatik Yedekleme</TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Yedekleme Geçmişi</CardTitle>
              <CardDescription>Önceki yedeklemeleri görüntüleyin ve yönetin.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Oluşturma Tarihi</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead>Tablolar</TableHead>
                        <TableHead>Dosya Boyutu</TableHead>
                        <TableHead>Tamamlanma Tarihi</TableHead>
                        <TableHead className="text-right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {backups.length > 0 ? (
                        backups.map((backup) => (
                          <TableRow key={backup.id}>
                            <TableCell>
                              {format(new Date(backup.created_at), "dd MMMM yyyy HH:mm", { locale: tr })}
                            </TableCell>
                            <TableCell>{getStatusBadge(backup.status)}</TableCell>
                            <TableCell>
                              <div className="max-w-[200px] truncate">
                                {backup.tables
                                  .map((table) => {
                                    const tableInfo = availableTables.find((t) => t.id === table)
                                    return tableInfo ? tableInfo.label : table
                                  })
                                  .join(", ")}
                              </div>
                            </TableCell>
                            <TableCell>{formatFileSize(backup.file_size)}</TableCell>
                            <TableCell>
                              {backup.completed_at
                                ? format(new Date(backup.completed_at), "dd MMMM yyyy HH:mm", { locale: tr })
                                : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {backup.status === "completed" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownloadBackup(backup)}
                                    disabled={loading}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => openDeleteDialog(backup)}
                                  disabled={loading}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            Henüz yedekleme bulunmuyor
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auto">
          <AutoBackupSchedule />
        </TabsContent>
      </Tabs>

      {/* Yeni Yedekleme Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni Yedekleme Oluştur</DialogTitle>
            <DialogDescription>
              Yedeklemek istediğiniz tabloları seçin ve yedekleme işlemini başlatın.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Yedeklenecek Tablolar</h3>
                <div className="space-y-2">
                  {availableTables.map((table) => (
                    <div key={table.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`table-${table.id}`}
                        checked={selectedTables.includes(table.id)}
                        onCheckedChange={(checked) => handleTableChange(table.id, checked === true)}
                      />
                      <Label htmlFor={`table-${table.id}`}>{table.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Bilgi</AlertTitle>
                <AlertDescription>
                  Yedekleme işlemi, seçilen tabloların verilerini JSON formatında kaydeder. Yedekleme işlemi, veri
                  miktarına bağlı olarak biraz zaman alabilir.
                </AlertDescription>
              </Alert>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              İptal
            </Button>
            <Button type="button" onClick={handleCreateBackup} disabled={loading || selectedTables.length === 0}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Yedekleniyor...
                </>
              ) : (
                "Yedeklemeyi Başlat"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Yedekleme Silme Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yedekleme Sil</DialogTitle>
            <DialogDescription>
              Bu yedeklemeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500">
              <strong>
                {selectedBackup?.created_at &&
                  format(new Date(selectedBackup.created_at), "dd MMMM yyyy HH:mm", { locale: tr })}
              </strong>{" "}
              tarihinde oluşturulan yedeklemeyi silmek üzeresiniz.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              İptal
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteBackup} disabled={loading}>
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
