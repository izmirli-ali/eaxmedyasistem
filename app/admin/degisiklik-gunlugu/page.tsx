"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, Database } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client" // Server yerine client kullanıyoruz

// Değişiklik tipi
type ChangeType = "feature" | "bugfix" | "improvement" | "database" | "security" | "other"

// Değişiklik kaydı
interface ChangeLog {
  id?: string
  version: string
  change_type: ChangeType
  description: string
  details?: string
  affected_components?: string[]
  created_by: string
  created_at?: string
  is_major: boolean
}

// Değişiklik tipi için badge rengi
const changeTypeBadgeVariant: Record<ChangeType, "default" | "secondary" | "destructive" | "outline"> = {
  feature: "default",
  improvement: "secondary",
  bugfix: "destructive",
  database: "outline",
  security: "destructive",
  other: "outline",
}

// Değişiklik tipi için Türkçe karşılık
const changeTypeLabel: Record<ChangeType, string> = {
  feature: "Yeni Özellik",
  improvement: "İyileştirme",
  bugfix: "Hata Düzeltme",
  database: "Veritabanı",
  security: "Güvenlik",
  other: "Diğer",
}

export default function DegisiklikGunluguPage() {
  const [changeLogs, setChangeLogs] = useState<ChangeLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tableExists, setTableExists] = useState(true)

  // Değişiklik kayıtlarını getir
  async function getChangeLogs(limit = 50): Promise<ChangeLog[]> {
    const supabase = createClient()

    try {
      // Önce tablonun var olup olmadığını kontrol et
      try {
        await supabase.from("change_logs").select("id").limit(1)
      } catch (error) {
        if (error.message && error.message.includes("does not exist")) {
          throw new Error('relation "public.change_logs" does not exist')
        }
      }

      const { data, error } = await supabase
        .from("change_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error("Değişiklik kayıtları alınırken hata:", error)
      throw error
    }
  }

  useEffect(() => {
    async function loadChangeLogs() {
      try {
        setLoading(true)
        setError(null)

        const logs = await getChangeLogs(100)
        setChangeLogs(logs)
      } catch (error) {
        console.error("Değişiklik kayıtları yüklenirken hata:", error)

        // Tablo yoksa özel hata mesajı
        if (error.message && error.message.includes("does not exist")) {
          setTableExists(false)
          setError("Değişiklik kayıtları tablosu bulunamadı. SQL dosyasını çalıştırmanız gerekiyor.")
        } else {
          setError("Değişiklik kayıtları yüklenirken bir hata oluştu.")
        }
      } finally {
        setLoading(false)
      }
    }

    loadChangeLogs()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-bold mb-2">Yükleniyor</h2>
          <p>Değişiklik kayıtları yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Tablo yoksa SQL kodunu göster
  if (!tableExists) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Değişiklik Günlüğü</h1>
        </div>

        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Tablo Bulunamadı</AlertTitle>
          <AlertDescription>
            Değişiklik kayıtları tablosu veritabanında bulunamadı. Aşağıdaki SQL kodunu Supabase SQL editöründe
            çalıştırarak tabloyu oluşturabilirsiniz.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              SQL Kodu - change_logs Tablosu
            </CardTitle>
            <CardDescription>Bu SQL kodunu Supabase SQL editöründe çalıştırın</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
              {`-- Değişiklik günlüğü tablosu
CREATE TABLE IF NOT EXISTS public.change_logs (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 version TEXT NOT NULL,
 change_type TEXT NOT NULL CHECK (change_type IN ('feature', 'bugfix', 'improvement', 'database', 'security', 'other')),
 description TEXT NOT NULL,
 details TEXT,
 affected_components TEXT[],
 created_by TEXT NOT NULL,
 created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
 is_major BOOLEAN DEFAULT false
);

-- RLS politikaları
ALTER TABLE public.change_logs ENABLE ROW LEVEL SECURITY;

-- Herkes değişiklik kayıtlarını okuyabilir
CREATE POLICY "Herkes değişiklik kayıtlarını okuyabilir" ON public.change_logs
 FOR SELECT USING (true);

-- Sadece adminler değişiklik kaydı ekleyebilir
CREATE POLICY "Adminler değişiklik kaydı ekleyebilir" ON public.change_logs
 FOR INSERT WITH CHECK (
   auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')
 );

-- Sadece adminler değişiklik kaydı güncelleyebilir
CREATE POLICY "Adminler değişiklik kaydı güncelleyebilir" ON public.change_logs
 FOR UPDATE USING (
   auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')
 );

-- İlk sürüm kaydını ekle
INSERT INTO public.change_logs (version, change_type, description, created_by, is_major)
VALUES ('1.0.0', 'feature', 'İlk sürüm', 'Sistem', true)
ON CONFLICT DO NOTHING;`}
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

  if (error) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-md text-red-800">
        <h2 className="text-lg font-bold mb-2">Hata</h2>
        <p>{error}</p>
      </div>
    )
  }

  // Değişiklik kayıtlarını sürüme göre grupla
  const changeLogsByVersion: Record<string, ChangeLog[]> = {}

  changeLogs.forEach((log) => {
    if (!changeLogsByVersion[log.version]) {
      changeLogsByVersion[log.version] = []
    }
    changeLogsByVersion[log.version].push(log)
  })

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Değişiklik Günlüğü</h1>
      </div>

      <div className="space-y-8">
        {Object.entries(changeLogsByVersion).map(([version, logs]) => (
          <Card key={version} className="overflow-hidden">
            <CardHeader className="bg-muted/50">
              <CardTitle>Sürüm {version}</CardTitle>
              <CardDescription>
                {logs[0]?.created_at ? new Date(logs[0].created_at).toLocaleDateString() : "Tarih bilgisi yok"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-4">
                {logs.map((log) => (
                  <li key={log.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-start gap-2">
                      <Badge variant={changeTypeBadgeVariant[log.change_type as ChangeType]}>
                        {changeTypeLabel[log.change_type as ChangeType]}
                      </Badge>
                      <div>
                        <p className="font-medium">{log.description}</p>
                        {log.details && <p className="text-sm text-muted-foreground mt-1">{log.details}</p>}
                        {log.affected_components && log.affected_components.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {log.affected_components.map((component) => (
                              <Badge key={component} variant="outline" className="text-xs">
                                {component}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Ekleyen: {log.created_by} • {log.created_at ? new Date(log.created_at).toLocaleString() : ""}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}

        {Object.keys(changeLogsByVersion).length === 0 && (
          <div className="text-center py-12 border rounded-md">
            <p className="text-muted-foreground">Henüz değişiklik kaydı bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  )
}
