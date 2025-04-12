"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Shield, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [checkingSession, setCheckingSession] = useState(true)

  // Supabase istemcisini oluştur
  const supabase = createClient()

  // Sayfa yüklendiğinde oturum kontrolü yap
  useEffect(() => {
    async function checkSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          // Kullanıcı rolünü kontrol et
          const { data: userData, error: userError } = await supabase
            .from("kullanicilar")
            .select("rol")
            .eq("id", session.user.id)
            .single()

          if (!userError && userData) {
            // Rol bazlı yönlendirme
            if (userData.rol === "admin") {
              router.push("/admin/dashboard")
            } else if (userData.rol === "sales") {
              router.push("/admin/isletme-listesi")
            } else {
              // Yetkisiz kullanıcı
              setError("Bu panele erişim yetkiniz bulunmamaktadır.")
              await supabase.auth.signOut()
            }
          } else {
            // Kullanıcı profili bulunamadı
            setError("Kullanıcı profili bulunamadı.")
          }
        }
      } catch (error) {
        console.error("Oturum kontrolü sırasında hata:", error)
      } finally {
        setCheckingSession(false)
      }
    }

    checkSession()
  }, [router, supabase])

  // Giriş işlemi
  const handleLogin = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      setError("E-posta ve şifre alanları zorunludur.")
      return
    }

    try {
      setLoading(true)
      setError("")

      // Supabase ile giriş yap
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data?.user) {
        // Kullanıcı rolünü kontrol et
        const { data: userData, error: userError } = await supabase
          .from("kullanicilar")
          .select("rol")
          .eq("id", data.user.id)
          .single()

        if (userError) {
          // Kullanıcı profili bulunamadı, oluşturmayı dene
          const { error: insertError } = await supabase.from("kullanicilar").insert([
            {
              id: data.user.id,
              email: data.user.email,
              ad_soyad: data.user.email?.split("@")[0] || "Kullanıcı",
              rol: "user", // Varsayılan olarak normal kullanıcı
            },
          ])

          if (insertError) {
            throw new Error("Kullanıcı profili oluşturulamadı.")
          }

          // Normal kullanıcılar admin paneline erişemez
          await supabase.auth.signOut()
          throw new Error("Bu panele erişim yetkiniz bulunmamaktadır.")
        }

        // Rol bazlı yönlendirme
        if (userData?.rol === "admin") {
          router.push("/admin/dashboard")
        } else if (userData?.rol === "sales") {
          router.push("/admin/isletme-listesi")
        } else {
          // Yetkisiz kullanıcı
          await supabase.auth.signOut()
          throw new Error("Bu panele erişim yetkiniz bulunmamaktadır.")
        }
      }
    } catch (error) {
      console.error("Giriş sırasında hata:", error)
      setError(error.message || "Giriş yapılırken bir hata oluştu.")
    } finally {
      setLoading(false)
    }
  }

  // Oturum kontrolü yapılırken yükleniyor ekranı göster
  if (checkingSession) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-bold mb-2">Oturum Kontrolü</h2>
          <p>Giriş durumunuz kontrol ediliyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-4">
        <Card className="border-2">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <Shield className="h-10 w-10 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Admin Girişi</CardTitle>
            <CardDescription>İşletme yönetim sistemine erişmek için giriş yapın</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Hata</AlertTitle>
                <AlertDescription>
                  {error === "Email not confirmed"
                    ? "E-posta adresiniz henüz doğrulanmamış. Lütfen e-posta kutunuzu kontrol edin veya yöneticinizle iletişime geçin."
                    : error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ornek@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Şifre</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Giriş Yapılıyor...
                    </>
                  ) : (
                    "Giriş Yap"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <p className="text-xs text-center text-gray-500 mt-4">
              Bu panel sadece yetkili kullanıcılar içindir. Erişim yetkiniz yoksa lütfen yöneticinizle iletişime geçin.
            </p>
            <p className="text-xs text-center text-gray-500 mt-2">
              İlk kez giriş yapıyorsanız, e-posta adresinize gönderilen doğrulama bağlantısını tıklamanız gerekebilir.
            </p>
            <Button variant="link" className="mt-2" onClick={() => router.push("/")}>
              Ana Sayfaya Dön
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
