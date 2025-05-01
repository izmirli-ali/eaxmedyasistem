"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, Clock, AlertTriangle, Plus, RefreshCw } from "lucide-react"
import { ReminderStatus, ReminderPriority, ReminderType } from "@/lib/content-reminder-service"
import { CreateReminderDialog } from "@/components/reminders/create-reminder-dialog"

export default function HatirlatmalarPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [reminders, setReminders] = useState([])
  const [activeTab, setActiveTab] = useState("pending")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedIsletmeId, setSelectedIsletmeId] = useState(null)
  const [isletmeler, setIsletmeler] = useState([])

  const supabase = createClient()

  // Hatırlatmaları yükle
  useEffect(() => {
    async function loadReminders() {
      try {
        setLoading(true)

        const response = await fetch(`/api/reminders?status=${activeTab}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Hatırlatmalar yüklenirken bir hata oluştu")
        }

        const data = await response.json()
        setReminders(data.reminders || [])
      } catch (error) {
        console.error("Hatırlatmalar yüklenirken hata:", error)
        toast({
          title: "Hata",
          description: error.message || "Hatırlatmalar yüklenirken bir hata oluştu",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadReminders()
  }, [activeTab, toast])

  // İşletmeleri yükle
  useEffect(() => {
    async function loadIsletmeler() {
      try {
        const { data, error } = await supabase
          .from("isletmeler")
          .select("id, isletme_adi")
          .order("isletme_adi", { ascending: true })

        if (error) throw error

        setIsletmeler(data || [])
      } catch (error) {
        console.error("İşletmeler yüklenirken hata:", error)
      }
    }

    loadIsletmeler()
  }, [supabase])

  // Hatırlatmaları yenile
  const handleRefresh = async () => {
    try {
      setLoading(true)

      const response = await fetch(`/api/reminders?status=${activeTab}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Hatırlatmalar yüklenirken bir hata oluştu")
      }

      const data = await response.json()
      setReminders(data.reminders || [])

      toast({
        title: "Başarılı",
        description: "Hatırlatmalar yenilendi",
      })
    } catch (error) {
      console.error("Hatırlatmalar yenilenirken hata:", error)
      toast({
        title: "Hata",
        description: error.message || "Hatırlatmalar yenilenirken bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Hatırlatma durumunu güncelle
  const handleUpdateStatus = async (reminderId, status) => {
    try {
      const response = await fetch("/api/reminders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reminderId,
          status,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Hatırlatma durumu güncellenirken bir hata oluştu")
      }

      // Hatırlatmaları yenile
      await handleRefresh()

      toast({
        title: "Başarılı",
        description: `Hatırlatma ${status === ReminderStatus.COMPLETED ? "tamamlandı" : "reddedildi"}`,
      })
    } catch (error) {
      console.error("Hatırlatma durumu güncellenirken hata:", error)
      toast({
        title: "Hata",
        description: error.message || "Hatırlatma durumu güncellenirken bir hata oluştu",
        variant: "destructive",
      })
    }
  }

  // Otomatik hatırlatmalar oluştur
  const handleCreateAutoReminders = async (isletmeId) => {
    try {
      const response = await fetch("/api/reminders/auto-create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isletmeId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Otomatik hatırlatmalar oluşturulurken bir hata oluştu")
      }

      // Hatırlatmaları yenile
      await handleRefresh()

      toast({
        title: "Başarılı",
        description: "Otomatik hatırlatmalar oluşturuldu",
      })
    } catch (error) {
      console.error("Otomatik hatırlatmalar oluşturulurken hata:", error)
      toast({
        title: "Hata",
        description: error.message || "Otomatik hatırlatmalar oluşturulurken bir hata oluştu",
        variant: "destructive",
      })
    }
  }

  // Öncelik badge'i
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case ReminderPriority.HIGH:
        return <Badge variant="destructive">Yüksek</Badge>
      case ReminderPriority.MEDIUM:
        return <Badge variant="default">Orta</Badge>
      case ReminderPriority.LOW:
        return <Badge variant="outline">Düşük</Badge>
      default:
        return null
    }
  }

  // Hatırlatma tipi metni
  const getReminderTypeText = (type) => {
    switch (type) {
      case ReminderType.BUSINESS_INFO_UPDATE:
        return "İşletme Bilgisi Güncelleme"
      case ReminderType.PHOTO_UPDATE:
        return "Fotoğraf Güncelleme"
      case ReminderType.OPENING_HOURS_CHECK:
        return "Çalışma Saatleri Kontrolü"
      case ReminderType.SERVICES_UPDATE:
        return "Hizmetler Güncelleme"
      case ReminderType.CONTACT_INFO_CHECK:
        return "İletişim Bilgileri Kontrolü"
      case ReminderType.DESCRIPTION_UPDATE:
        return "Açıklama Güncelleme"
      case ReminderType.REVIEW_RESPONSE:
        return "Yorum Yanıtlama"
      case ReminderType.GOOGLE_POSTS:
        return "Google Gönderileri"
      case ReminderType.SEO_OPTIMIZATION:
        return "SEO Optimizasyonu"
      default:
        return type
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">İçerik Güncelliği Hatırlatmaları</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Hatırlatma
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value={ReminderStatus.PENDING}>
            <Clock className="h-4 w-4 mr-2" />
            Bekleyen
          </TabsTrigger>
          <TabsTrigger value={ReminderStatus.OVERDUE}>
            <AlertTriangle className="h-4 w-4 mr-2" />
            Vadesi Geçmiş
          </TabsTrigger>
          <TabsTrigger value={ReminderStatus.COMPLETED}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Tamamlanan
          </TabsTrigger>
          <TabsTrigger value={ReminderStatus.DISMISSED}>
            <XCircle className="h-4 w-4 mr-2" />
            Reddedilen
          </TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === ReminderStatus.PENDING && "Bekleyen Hatırlatmalar"}
              {activeTab === ReminderStatus.OVERDUE && "Vadesi Geçmiş Hatırlatmalar"}
              {activeTab === ReminderStatus.COMPLETED && "Tamamlanan Hatırlatmalar"}
              {activeTab === ReminderStatus.DISMISSED && "Reddedilen Hatırlatmalar"}
            </CardTitle>
            <CardDescription>
              {activeTab === ReminderStatus.PENDING && "Yaklaşan ve bekleyen içerik güncelliği hatırlatmaları"}
              {activeTab === ReminderStatus.OVERDUE && "Vadesi geçmiş ve tamamlanmamış hatırlatmalar"}
              {activeTab === ReminderStatus.COMPLETED && "Tamamlanmış hatırlatmalar geçmişi"}
              {activeTab === ReminderStatus.DISMISSED && "Reddedilmiş hatırlatmalar geçmişi"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : reminders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Henüz hatırlatma bulunmuyor.</p>
                {activeTab === ReminderStatus.PENDING && isletmeler.length > 0 && (
                  <div className="flex flex-col items-center gap-4">
                    <p className="text-sm">Bir işletme için otomatik hatırlatmalar oluşturmak ister misiniz?</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {isletmeler.map((isletme) => (
                        <Button
                          key={isletme.id}
                          variant="outline"
                          size="sm"
                          onClick={() => handleCreateAutoReminders(isletme.id)}
                        >
                          {isletme.isletme_adi} için Oluştur
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {reminders.map((reminder) => (
                  <div key={reminder.id} className="border rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{reminder.title}</h3>
                        {getPriorityBadge(reminder.priority)}
                        <Badge variant="outline">{getReminderTypeText(reminder.type)}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {(activeTab === ReminderStatus.PENDING || activeTab === ReminderStatus.OVERDUE) && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus(reminder.id, ReminderStatus.COMPLETED)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Tamamla
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus(reminder.id, ReminderStatus.DISMISSED)}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reddet
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-2">{reminder.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>Vade Tarihi: {new Date(reminder.due_date).toLocaleDateString("tr-TR")}</span>
                      {reminder.completed_at && (
                        <span>Tamamlanma: {new Date(reminder.completed_at).toLocaleDateString("tr-TR")}</span>
                      )}
                      {reminder.dismissed_at && (
                        <span>Reddedilme: {new Date(reminder.dismissed_at).toLocaleDateString("tr-TR")}</span>
                      )}
                      {reminder.recurrence && (
                        <span>
                          Tekrarlama:{" "}
                          {reminder.recurrence === "daily"
                            ? "Günlük"
                            : reminder.recurrence === "weekly"
                              ? "Haftalık"
                              : reminder.recurrence === "monthly"
                                ? "Aylık"
                                : reminder.recurrence === "quarterly"
                                  ? "3 Aylık"
                                  : reminder.recurrence === "yearly"
                                    ? "Yıllık"
                                    : reminder.recurrence}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Tabs>

      <CreateReminderDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        isletmeler={isletmeler}
        onSuccess={handleRefresh}
      />
    </div>
  )
}
