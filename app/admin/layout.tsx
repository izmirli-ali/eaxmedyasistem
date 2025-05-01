"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Sidebar } from "@/components/admin-sidebar"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  // Supabase istemcisini oluştur
  const supabase = createClient()

  // Oturum kontrolü ve yönlendirme mantığını basitleştir
  useEffect(() => {
    let isMounted = true // Komponent unmount olduktan sonra state güncellemelerini engelle

    async function checkAuthAndRole() {
      try {
        console.log("[AdminLayout] Oturum kontrolü başlatılıyor...")

        // Mevcut oturumu kontrol et
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("[AdminLayout] Oturum hatası:", sessionError)
          if (isMounted) setAuthError(sessionError.message)
          return
        }

        console.log("[AdminLayout] Oturum durumu:", session ? "Oturum var" : "Oturum yok")

        // Eğer oturum yoksa ve admin giriş sayfasında değilse, giriş sayfasına yönlendir
        if (!session) {
          if (pathname !== "/admin" && isMounted) {
            console.log("[AdminLayout] Oturum yok, /admin sayfasına yönlendiriliyor")
            router.replace("/admin")
          }
          return
        }

        // Kullanıcı giriş yapmış, rolünü kontrol et
        try {
          const { data: userData, error: userError } = await supabase
            .from("kullanicilar")
            .select("rol")
            .eq("id", session.user.id)
            .single()

          if (userError) {
            console.error("[AdminLayout] Kullanıcı bilgileri alınamadı:", userError)
            if (isMounted) setAuthError("Kullanıcı bilgileri alınamadı")
            return
          }

          if (isMounted) {
            setIsLoggedIn(true)
            setUserRole(userData?.rol)
          }
        } catch (userErr) {
          console.error("[AdminLayout] Kullanıcı verisi alınırken hata:", userErr)
          if (isMounted) setAuthError("Kullanıcı verisi alınırken hata oluştu")
        }
      } catch (error) {
        console.error("[AdminLayout] Yetkilendirme kontrolü sırasında hata:", error)
        if (isMounted) setAuthError("Yetkilendirme kontrolü sırasında hata oluştu")
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    checkAuthAndRole()

    // Cleanup function
    return () => {
      isMounted = false
    }
  }, [pathname]) // pathname değiştiğinde tekrar kontrol et, ama router'ı bağımlılıklara ekleme

  // Rol bazlı erişim kontrolü
  const hasAccess = (role: string | null, path: string): boolean => {
    // Admin her yere erişebilir
    if (role === "admin") return true

    // Satış temsilcisi sadece belirli sayfalara erişebilir
    if (role === "sales") {
      const allowedPaths = ["/admin/isletme-listesi", "/admin/isletme-kayit", "/admin/isletme-duzenle"]

      // İşletme detay sayfalarına da erişebilmeli
      if (path.startsWith("/admin/isletme/")) return true

      return allowedPaths.some((allowedPath) => path === allowedPath || path.startsWith(allowedPath))
    }

    // Diğer roller için erişim yok
    return false
  }

  // Eğer login sayfasındaysa, sidebar'ı gösterme
  if (pathname === "/admin") {
    return <>{children}</>
  }

  // Yükleme durumunda
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-bold mb-2">Yetkilendirme Kontrolü</h2>
          <p>Giriş durumunuz kontrol ediliyor...</p>
        </div>
      </div>
    )
  }

  // Hata durumunda
  if (authError) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Yetkilendirme Hatası</h2>
          <p>{authError}</p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md" onClick={() => router.push("/admin")}>
            Giriş Sayfasına Dön
          </button>
        </div>
      </div>
    )
  }

  // Giriş yapmamış veya yetkisi yoksa
  if (!isLoggedIn || !userRole || !hasAccess(userRole, pathname)) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Yetkisiz Erişim</h2>
          <p>Bu sayfaya erişmek için gerekli yetkiye sahip değilsiniz.</p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md" onClick={() => router.push("/admin")}>
            Giriş Sayfasına Dön
          </button>
        </div>
      </div>
    )
  }

  // Yetkili kullanıcı için normal görünüm
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4">{children}</main>
    </div>
  )
}
