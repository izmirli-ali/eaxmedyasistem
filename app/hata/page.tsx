"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { Suspense } from "react"

function ErrorPageInner() {
  const searchParams = useSearchParams()
  const errorCode = searchParams.get("kod")

  // Hata koduna göre mesaj belirle
  let errorTitle = "Bir Hata Oluştu"
  let errorMessage = "Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin."

  if (errorCode === "redirect_loop") {
    errorTitle = "Yönlendirme Döngüsü Tespit Edildi"
    errorMessage =
      "Sayfalar arasında sürekli bir yönlendirme döngüsü tespit edildi. Bu genellikle bir yapılandırma hatasından kaynaklanır."
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-amber-500" />
          </div>
          <CardTitle className="text-2xl">{errorTitle}</CardTitle>
          <CardDescription>{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Sorun devam ederse, lütfen tarayıcı önbelleğinizi temizleyin veya destek ekibimizle iletişime geçin.
            </p>
            <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>Hata Kodu:</strong> {errorCode || "unknown"}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Ana Sayfaya Dön
          </Button>
          <Button onClick={() => window.location.reload()}>Sayfayı Yenile</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <ErrorPageInner />
    </Suspense>
  )
}
