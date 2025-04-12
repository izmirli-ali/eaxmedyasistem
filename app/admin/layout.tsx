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

  // Supabase istemcisini oluştur - singleton pattern kullanarak
  const supabase = createClient()

  // Oturum kontrolü ve yönlendirme mantığını iyileştir
  useEffect(() => {
    // Kullanıcı oturumunu ve admin yetkisini kontrol et
    async function checkAuthAndRole() {
      try {
        console.log("Oturum kontrolü başlatılıyor...")
        // Mevcut oturumu kontrol et
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Oturum hatası:", sessionError)
          throw sessionError
        }

        console.log("Oturum durumu:", session ? "Oturum var" : "Oturum yok")

        if (!session) {
          // Oturum yoksa, giriş sayfasına yönlendir
          setIsLoggedIn(false)
          setUserRole(null)
          setLoading(false)

          if (pathname !== "/admin" && pathname.startsWith("/admin")) {
            console.log("Oturum yok, /admin sayfasına yönlendiriliyor")
            router.push("/admin")
            return
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
            console.error("Kullanıcı bilgileri alınamadı:", userError)

            // Kullanıcı profili bulunamadı, oluşturmayı deneyelim
            try {
              const { error: insertError } = await supabase.from("kullanicilar").insert([
                {
                  id: session.user.id,
                  email: session.user.email,
                  ad_soyad: session.user.email?.split("@")[0] || "Kullanıcı",
                  rol: "user", // Varsayılan olarak normal kullanıcı
                },
              ])

              if (insertError) {
                console.error("Kullanıcı profili oluşturulamadı:", insertError)
                throw insertError
              }

              // Yeni oluşturulan profili kontrol et
              const { data: newUserData, error: newUserError } = await supabase
                .from("kullanicilar")
                .select("rol")
                .eq("id", session.user.id)
                .single()

              if (newUserError) {
                throw newUserError
              }

              setIsLoggedIn(true)
              setUserRole(newUserData?.rol)
              setLoading(false)

              // Erişim kontrolü
              if (!hasAccess(newUserData?.rol, pathname)) {
                router.push(getDefaultRoute(newUserData?.rol))
              }

              return
            } catch (insertErr) {
              console.error("Kullanıcı oluşturma hatası:", insertErr)
              // Hata durumunda oturumu kapat
              await supabase.auth.signOut()
              setIsLoggedIn(false)
              setUserRole(null)
              setLoading(false)
              router.push("/admin")
              return
            }
          } else {
            // Kullanıcı verisi başarıyla alındı
            setIsLoggedIn(true)
            setUserRole(userData?.rol)
            setLoading(false)

            // Erişim kontrolü
            if (!hasAccess(userData?.rol, pathname)) {
              router.push(getDefaultRoute(userData?.rol))
            }
          }
        } catch (userErr) {
          console.error("Kullanıcı verisi alınırken hata:", userErr)
          setIsLoggedIn(false)
          setUserRole(null)
          setLoading(false)
          router.push("/admin")
        }
      } catch (error) {
        console.error("Yetkilendirme kontrolü sırasında hata:", error)
        setIsLoggedIn(false)
        setUserRole(null)
        setLoading(false)

        if (pathname !== "/admin") {
          router.push("/admin")
        }
      }
    }

    // Sadece bir kez çalıştır
    checkAuthAndRole()
  }, [pathname, router]) // pathname değiştiğinde tekrar kontrol et

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

  // Rol bazlı varsayılan yönlendirme
  const getDefaultRoute = (role: string | null): string => {
    switch (role) {
      case "admin":
        return "/admin/dashboard"
      case "sales":
        return "/admin/isletme-listesi"
      default:
        return "/admin"
    }
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
