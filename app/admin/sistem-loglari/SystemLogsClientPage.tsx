"use client"

import { createClient } from "@/lib/supabase/client" // Server yerine client kullanıyoruz
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, Database } from "lucide-react"
import { useEffect, useState } from "react"

export default function SystemLogsClientPage() {
  const [logs, setLogs] = useState<any[] | null>(null)
  const [error, setError] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // fetchData fonksiyonunu düzeltiyoruz
    const fetchData = async () => {
      const supabase = createClient()
      setLoading(true)

      try {
        // Sistem loglarını getir (son 100 log)
        const { data, error } = await supabase
          .from("system_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100)

        if (error) {
          // Tablo yoksa veya başka bir hata varsa
          if (error.message && error.message.includes("does not exist")) {
            setError({ message: "Sistem logları tablosu bulunamadı. SQL dosyasını çalıştırmanız gerekiyor." })
          } else {
            setError(error)
          }
        } else {
          setLogs(data || [])
        }
      } catch (err) {
        console.error("Sistem logları yüklenirken hata:", err)
        setError({ message: "Sistem logları yüklenirken bir hata oluştu." })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Log türlerine göre renk belirle
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "success":
        return "bg-green-100 text-green-800"
      case "error":
        return "bg-red-100 text-red-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "info":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Log türlerine göre Türkçe metin
  const getActionText = (action: string) => {
    switch (action) {
      case "scheduled_backup":
        return "Otomatik Yedekleme"
      case "manual_backup":
        return "Manuel Yedekleme"
      case "system_update":
        return "Sistem Güncellemesi"
      case "user_login":
        return "Kullanıcı Girişi"
      case "user_logout":
        return "Kullanıcı Çıkışı"
      case "user_created":
        return "Kullanıcı Oluşturuldu"
      case "user_updated":
        return "Kullanıcı Güncellendi"
      case "user_deleted":
        return "Kullanıcı Silindi"
      default:
        return action
    }
  }

  // Tablo yoksa SQL kodunu göster
  if (error && error.message?.includes("does not exist")) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Sistem Logları</h1>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Tablo Bulunamadı</AlertTitle>
          <AlertDescription>
            Sistem logları tablosu veritabanında bulunamadı. Aşağıdaki SQL kodunu Supabase SQL editöründe çalıştırarak
            tabloyu oluşturabilirsiniz.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              SQL Kodu - system_logs Tablosu
            </CardTitle>
            <CardDescription>Bu SQL kodunu Supabase SQL editöründe çalıştırın</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
              {`-- Sistem logları tablosu
CREATE TABLE IF NOT EXISTS public.system_logs (
   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
   action TEXT NOT NULL,
   status TEXT NOT NULL,
   details JSONB,
   user_id UUID REFERENCES auth.users(id)
);

-- RLS politikaları
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Sadece adminler tüm logları görebilir
CREATE POLICY "Adminler tüm sistem loglarını görebilir" ON public.system_logs
   FOR SELECT
   USING (
       EXISTS (
           SELECT 1 FROM public.kullanicilar
           WHERE kullanicilar.id = auth.uid() AND kullanicilar.rol = 'admin'
       )
   );

-- Sadece adminler log ekleyebilir (manuel olarak)
CREATE POLICY "Adminler log ekleyebilir" ON public.system_logs
   FOR INSERT
   WITH CHECK (
       EXISTS (
           SELECT 1 FROM public.kullanicilar
           WHERE kullanicilar.id = auth.uid() AND kullanicilar.rol = 'admin'
       )
   );

-- Servis rolü her zaman log ekleyebilir (otomatik işlemler için)
CREATE POLICY "Servis rolü log ekleyebilir" ON public.system_logs
   FOR INSERT
   WITH CHECK (auth.role() = 'service_role');

-- İndeks oluştur
CREATE INDEX IF NOT EXISTS system_logs_action_idx ON public.system_logs (action);
CREATE INDEX IF NOT EXISTS system_logs_status_idx ON public.system_logs (status);
CREATE INDEX IF NOT EXISTS system_logs_created_at_idx ON public.system_logs (created_at);`}
            </pre>
          </CardContent>
        </Card>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600 mb-4">SQL kodunu çalıştırdıktan sonra bu sayfayı yenileyin.</p>
          <Button onClick={() => window.location.reload()}>Sayfayı Yenile</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sistem Logları</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sistem Aktiviteleri</CardTitle>
          <CardDescription>Sistemde gerçekleşen önemli olayların kaydı</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-4 text-center text-gray-500">Yükleniyor...</div>
          ) : error ? (
            <div className="p-4 text-red-700 bg-red-100 rounded">
              Loglar yüklenirken bir hata oluştu: {error.message}
            </div>
          ) : logs && logs.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>İşlem</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Detaylar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(log.created_at), "dd MMMM yyyy HH:mm:ss", { locale: tr })}
                      </TableCell>
                      <TableCell>{getActionText(log.action)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(log.status)}>
                          {log.status === "success"
                            ? "Başarılı"
                            : log.status === "error"
                              ? "Hata"
                              : log.status === "warning"
                                ? "Uyarı"
                                : log.status === "info"
                                  ? "Bilgi"
                                  : log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {log.details && typeof log.details === "object"
                          ? log.details.message || JSON.stringify(log.details)
                          : log.details || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">Henüz log kaydı bulunmuyor.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
