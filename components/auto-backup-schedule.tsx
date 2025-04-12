"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Loader2, Save, Clock, Calendar, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"

// Tablo listesi
const availableTables = [
  { id: "isletmeler", label: "İşletmeler" },
  { id: "kullanicilar", label: "Kullanıcılar" },
  { id: "musteriler", label: "Müşteriler" },
  { id: "site_ayarlari", label: "Site Ayarları" },
  { id: "notifications", label: "Bildirimler" },
  { id: "tasks", label: "Görevler" },
]

// Yedekleme zamanlaması tipi
type BackupSchedule = {
  id: number
  enabled: boolean
  frequency: "daily" | "weekly" | "monthly"
  time_of_day: string
  day_of_week: number
  day_of_month: number
  tables: string[]
  retention_count: number
  last_run?: string
  next_run?: string
  created_at: string
  updated_at: string
}

export function AutoBackupSchedule() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tableExists, setTableExists] = useState(false)
  const [schedule, setSchedule] = useState<BackupSchedule>({
    id: 1,
    enabled: false,
    frequency: "daily",
    time_of_day: "03:00",
    day_of_week: 1,
    day_of_month: 1,
    tables: ["isletmeler", "kullanicilar", "musteriler", "site_ayarlari"],
    retention_count: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  // Supabase client
  const supabase = createClient()

  // Yedekleme zamanlamasını yükle
  useEffect(() => {
    loadSchedule()
  }, [])

  // Yedekleme zamanlamasını yükle
  const loadSchedule = async () => {
    try {
      setLoading(true)
      setError(null)

      // Önce backup_schedules tablosunun var olup olmadığını kontrol edelim
      const { data: tableCheck, error: tableCheckError } = await supabase
        .from("backup_schedules")
        .select("id")
        .limit(1)
        .maybeSingle()

      // Tablo yoksa veya erişim hatası varsa
      if (tableCheckError) {
        console.warn("Backup schedules tablosu kontrolünde hata:", tableCheckError)
        setTableExists(false)
        setLoading(false)
        return
      }

      setTableExists(true)

      // Zamanlama bilgisini getir
      const { data, error } = await supabase.from("backup_schedules").select("*").eq("id", 1).single()

      if (error) {
        if (error.code === "PGRST116") {
          // Kayıt bulunamadı, varsayılan değerleri kullan
          console.log("Zamanlama kaydı bulunamadı, varsayılan değerler kullanılacak")
        } else {
          throw error
        }
      } else if (data) {
        // Zaman formatını düzelt (HH:MM:SS -> HH:MM)
        const timeOfDay = data.time_of_day ? data.time_of_day.substring(0, 5) : "03:00"

        setSchedule({
          ...data,
          time_of_day: timeOfDay,
        })
      }
    } catch (error) {
      console.error("Yedekleme zamanlaması yüklenirken hata:", error)
      setError(error.message || "Yedekleme zamanlaması yüklenirken bir hata oluştu")
      toast({
        title: "Hata",
        description: error.message || "Yedekleme zamanlaması yüklenirken bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Tablo seçimini değiştir
  const handleTableChange = (tableId: string, checked: boolean) => {
    if (checked) {
      setSchedule((prev) => ({
        ...prev,
        tables: [...prev.tables, tableId],
      }))
    } else {
      setSchedule((prev) => ({
        ...prev,
        tables: prev.tables.filter((id) => id !== tableId),
      }))
    }
  }

  // Zamanlama değişikliklerini işle
  const handleScheduleChange = (name: string, value: any) => {
    setSchedule((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Zamanlamayı kaydet
  const handleSaveSchedule = async () => {
    if (!tableExists) {
      toast({
        title: "Hata",
        description: "Yedekleme zamanlaması tablosu bulunamadı. Lütfen veritabanı yapılandırmasını kontrol edin.",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      setError(null)

      // Bir sonraki çalışma zamanını hesapla
      const nextRun = calculateNextRun()

      // Zamanlamayı güncelle
      const { error } = await supabase.from("backup_schedules").upsert([
        {
          id: 1, // Tek bir kayıt olduğu için sabit ID
          ...schedule,
          time_of_day: schedule.time_of_day + ":00", // HH:MM -> HH:MM:SS
          next_run: nextRun,
          updated_at: new Date().toISOString(),
        },
      ])

      if (error) throw error

      toast({
        title: "Başarılı",
        description: "Yedekleme zamanlaması başarıyla kaydedildi.",
      })

      // Zamanlamayı yeniden yükle
      loadSchedule()
    } catch (error) {
      console.error("Yedekleme zamanlaması kaydedilirken hata:", error)
      setError(error.message || "Yedekleme zamanlaması kaydedilirken bir hata oluştu")
      toast({
        title: "Hata",
        description: error.message || "Yedekleme zamanlaması kaydedilirken bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Bir sonraki çalışma zamanını hesapla
  const calculateNextRun = () => {
    const now = new Date()
    const [hours, minutes] = schedule.time_of_day.split(":").map(Number)
    const nextRun = new Date(now)

    nextRun.setHours(hours, minutes, 0, 0)

    // Eğer belirtilen zaman bugün geçtiyse, bir sonraki periyoda ayarla
    if (nextRun <= now) {
      if (schedule.frequency === "daily") {
        nextRun.setDate(nextRun.getDate() + 1)
      } else if (schedule.frequency === "weekly") {
        // Haftanın gününe ayarla (1-7, Pazartesi-Pazar)
        const currentDay = nextRun.getDay() || 7 // JS'de 0-6, Pazar-Cumartesi, biz 1-7 Pazartesi-Pazar kullanıyoruz
        const daysToAdd = (schedule.day_of_week - currentDay + 7) % 7 || 7
        nextRun.setDate(nextRun.getDate() + daysToAdd)
      } else if (schedule.frequency === "monthly") {
        // Ayın gününe ayarla
        nextRun.setDate(schedule.day_of_month)
        // Eğer bu ay geçtiyse, bir sonraki aya ayarla
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1)
        }
      }
    }

    return nextRun.toISOString()
  }

  // Haftanın günü seçenekleri
  const daysOfWeek = [
    { value: 1, label: "Pazartesi" },
    { value: 2, label: "Salı" },
    { value: 3, label: "Çarşamba" },
    { value: 4, label: "Perşembe" },
    { value: 5, label: "Cuma" },
    { value: 6, label: "Cumartesi" },
    { value: 7, label: "Pazar" },
  ]

  // Ayın günü seçenekleri
  const daysOfMonth = Array.from({ length: 31 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}`,
  }))

  // Son çalışma zamanını formatla
  const formatLastRun = (lastRun?: string) => {
    if (!lastRun) return "Henüz çalışmadı"
    return new Date(lastRun).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Bir sonraki çalışma zamanını formatla
  const formatNextRun = (nextRun?: string) => {
    if (!nextRun) return "Planlanmadı"
    return new Date(nextRun).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Tablo yoksa SQL kodunu göster
  if (!tableExists) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Otomatik Yedekleme Zamanlaması</CardTitle>
          <CardDescription>Yedekleme zamanlaması tablosu bulunamadı.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Tablo Bulunamadı</AlertTitle>
            <AlertDescription>
              Yedekleme zamanlaması tablosu veritabanında bulunamadı. Lütfen SQL dosyasını çalıştırarak tabloyu
              oluşturun.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Tablo Oluşturma SQL Kodu</h3>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
              {`-- Otomatik yedekleme zamanlama tablosu
CREATE TABLE IF NOT EXISTS public.backup_schedules (
  id INTEGER PRIMARY KEY DEFAULT 1, -- Tek bir kayıt olacağı için sabit ID
  enabled BOOLEAN DEFAULT false,
  frequency TEXT DEFAULT 'daily', -- daily, weekly, monthly
  time_of_day TIME DEFAULT '03:00:00', -- Günün hangi saatinde çalışacak
  day_of_week INTEGER DEFAULT 1, -- Haftanın hangi günü (1-7, Pazartesi-Pazar)
  day_of_month INTEGER DEFAULT 1, -- Ayın hangi günü (1-31)
  tables TEXT[] DEFAULT ARRAY['isletmeler', 'kullanicilar', 'musteriler', 'site_ayarlari']::TEXT[],
  retention_count INTEGER DEFAULT 10, -- Saklanacak maksimum yedek sayısı
  last_run TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Varsayılan zamanlama kaydını ekle
INSERT INTO public.backup_schedules (id, enabled, frequency, time_of_day)
VALUES (1, false, 'daily', '03:00:00')
ON CONFLICT (id) DO NOTHING;

-- RLS politikaları
ALTER TABLE public.backup_schedules ENABLE ROW LEVEL SECURITY;

-- Admin kullanıcıları için politikalar
CREATE POLICY "Adminler yedekleme zamanlamalarını okuyabilir" ON public.backup_schedules
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')
  );

CREATE POLICY "Adminler yedekleme zamanlamalarını güncelleyebilir" ON public.backup_schedules
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')
  );

CREATE POLICY "Adminler yedekleme zamanlaması ekleyebilir" ON public.backup_schedules
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')
  );`}
            </pre>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Otomatik Yedekleme Zamanlaması</CardTitle>
        <CardDescription>Düzenli yedeklemeler için bir zamanlama oluşturun.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Hata</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Etkinleştirme Anahtarı */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">Otomatik Yedekleme</Label>
              <p className="text-sm text-muted-foreground">Düzenli otomatik yedeklemeleri etkinleştirin.</p>
            </div>
            <Switch
              id="enabled"
              checked={schedule.enabled}
              onCheckedChange={(checked) => handleScheduleChange("enabled", checked)}
            />
          </div>

          {/* Zamanlama Ayarları */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Zamanlama Ayarları</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sıklık */}
              <div className="space-y-2">
                <Label htmlFor="frequency">Sıklık</Label>
                <Select value={schedule.frequency} onValueChange={(value) => handleScheduleChange("frequency", value)}>
                  <SelectTrigger id="frequency">
                    <SelectValue placeholder="Sıklık seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Günlük</SelectItem>
                    <SelectItem value="weekly">Haftalık</SelectItem>
                    <SelectItem value="monthly">Aylık</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Saat */}
              <div className="space-y-2">
                <Label htmlFor="time_of_day">Saat</Label>
                <Input
                  id="time_of_day"
                  type="time"
                  value={schedule.time_of_day}
                  onChange={(e) => handleScheduleChange("time_of_day", e.target.value)}
                />
              </div>

              {/* Haftanın Günü (Haftalık seçildiğinde) */}
              {schedule.frequency === "weekly" && (
                <div className="space-y-2">
                  <Label htmlFor="day_of_week">Haftanın Günü</Label>
                  <Select
                    value={schedule.day_of_week.toString()}
                    onValueChange={(value) => handleScheduleChange("day_of_week", Number.parseInt(value))}
                  >
                    <SelectTrigger id="day_of_week">
                      <SelectValue placeholder="Gün seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map((day) => (
                        <SelectItem key={day.value} value={day.value.toString()}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Ayın Günü (Aylık seçildiğinde) */}
              {schedule.frequency === "monthly" && (
                <div className="space-y-2">
                  <Label htmlFor="day_of_month">Ayın Günü</Label>
                  <Select
                    value={schedule.day_of_month.toString()}
                    onValueChange={(value) => handleScheduleChange("day_of_month", Number.parseInt(value))}
                  >
                    <SelectTrigger id="day_of_month">
                      <SelectValue placeholder="Gün seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfMonth.map((day) => (
                        <SelectItem key={day.value} value={day.value.toString()}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Saklama Sayısı */}
              <div className="space-y-2">
                <Label htmlFor="retention_count">Saklama Sayısı</Label>
                <Input
                  id="retention_count"
                  type="number"
                  min="1"
                  max="100"
                  value={schedule.retention_count}
                  onChange={(e) => handleScheduleChange("retention_count", Number.parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">Saklanacak maksimum yedek sayısı.</p>
              </div>
            </div>
          </div>

          {/* Yedeklenecek Tablolar */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Yedeklenecek Tablolar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {availableTables.map((table) => (
                <div key={table.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`table-${table.id}`}
                    checked={schedule.tables.includes(table.id)}
                    onCheckedChange={(checked) => handleTableChange(table.id, checked === true)}
                  />
                  <Label htmlFor={`table-${table.id}`}>{table.label}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Durum Bilgisi */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Durum Bilgisi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Son Çalışma Zamanı</Label>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formatLastRun(schedule.last_run)}</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Bir Sonraki Çalışma</Label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatNextRun(schedule.next_run)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bilgi Notu */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Bilgi</AlertTitle>
            <AlertDescription>
              Otomatik yedekleme, belirtilen zamanda arka planda çalışacaktır. Bu özelliğin çalışması için Vercel Cron
              Jobs veya harici bir cron servisi yapılandırmanız gerekir.
            </AlertDescription>
          </Alert>

          {/* Kaydet Butonu */}
          <Button onClick={handleSaveSchedule} disabled={saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Zamanlamayı Kaydet
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
