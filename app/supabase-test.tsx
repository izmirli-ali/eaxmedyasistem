"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function SupabaseTest() {
  const [testResults, setTestResults] = useState<{
    connection: boolean
    auth: boolean
    database: boolean
    message: string
    loading: boolean
  }>({
    connection: false,
    auth: false,
    database: false,
    message: "",
    loading: false,
  })

  const runTests = async () => {
    setTestResults({
      ...testResults,
      loading: true,
      message: "Testler çalıştırılıyor...",
    })

    try {
      const supabase = createClient()
      const results = {
        connection: false,
        auth: false,
        database: false,
        message: "",
        loading: true,
      }

      // Bağlantı testi
      try {
        const { data, error } = await supabase.from("kullanicilar").select("count", { count: "exact", head: true })
        if (!error) {
          results.connection = true
          results.message = "Supabase bağlantısı başarılı!"
        } else {
          throw error
        }
      } catch (error) {
        results.message = `Bağlantı hatası: ${error.message || "Bilinmeyen hata"}`
        setTestResults({ ...results, loading: false })
        return
      }

      // Veritabanı testi
      try {
        const { data, error } = await supabase.from("kullanicilar").select("id").limit(1)
        if (!error) {
          results.database = true
          results.message += " Veritabanı erişimi başarılı!"
        } else {
          results.message += ` Veritabanı hatası: ${error.message}`
        }
      } catch (error) {
        results.message += ` Veritabanı hatası: ${error.message || "Bilinmeyen hata"}`
      }

      // Auth testi
      try {
        const { data, error } = await supabase.auth.getSession()
        if (!error) {
          results.auth = true
          results.message += " Auth servisi çalışıyor!"
        } else {
          results.message += ` Auth hatası: ${error.message}`
        }
      } catch (error) {
        results.message += ` Auth hatası: ${error.message || "Bilinmeyen hata"}`
      }

      setTestResults({ ...results, loading: false })
    } catch (error) {
      setTestResults({
        connection: false,
        auth: false,
        database: false,
        message: `Genel hata: ${error.message || "Bilinmeyen hata"}`,
        loading: false,
      })
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Supabase Bağlantı Testi</CardTitle>
          <CardDescription>Bu sayfa Supabase bağlantınızı test etmenize yardımcı olur</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Bağlantı Durumu:</span>
              {testResults.loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              ) : testResults.connection ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>Veritabanı Erişimi:</span>
              {testResults.loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              ) : testResults.database ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>Auth Servisi:</span>
              {testResults.loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              ) : testResults.auth ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
            {testResults.message && (
              <div className="mt-4 p-3 bg-gray-100 rounded-md text-sm">
                <p className="font-medium">Sonuç:</p>
                <p>{testResults.message}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={runTests} disabled={testResults.loading} className="w-full">
            {testResults.loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Test Ediliyor...
              </>
            ) : (
              "Bağlantıyı Test Et"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
