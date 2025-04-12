"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@supabase/supabase-js"
import {
  LayoutDashboard,
  Store,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Users,
  Shield,
  ListChecks,
  PlusCircle,
  FileText,
  CreditCard,
  Bell,
  CheckSquare,
  History,
  ActivityIcon as ActivityLog,
} from "lucide-react"

// Bildirim merkezini import et
import { NotificationCenter } from "@/components/notification-center"

export function Sidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [userRole, setUserRole] = useState<string | null>(null)

  // Supabase istemcisini oluştur
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  )

  // Kullanıcı bilgilerini yükle
  useEffect(() => {
    async function loadUserInfo() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          setUserEmail(session.user.email || "")

          // Kullanıcı rolünü al
          const { data: userData, error } = await supabase
            .from("kullanicilar")
            .select("rol")
            .eq("id", session.user.id)
            .single()

          if (!error && userData) {
            setUserRole(userData.rol)
          }
        }
      } catch (error) {
        console.error("Kullanıcı bilgileri yüklenirken hata:", error)
      }
    }

    loadUserInfo()
  }, []) // Boş bağımlılık dizisi - sadece bir kez çalışacak

  // Çıkış yap
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = "/admin"
    } catch (error) {
      console.error("Çıkış yapılırken hata:", error)
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const toggleSubmenu = () => {
    setIsSubmenuOpen(!isSubmenuOpen)
  }

  // Admin için tüm menü öğeleri
  const adminNavItems = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "İşletme Yönetimi",
      icon: <Store className="h-5 w-5" />,
      submenu: [
        {
          title: "İşletme Listesi",
          href: "/admin/isletme-listesi",
        },
        {
          title: "İşletme Ekle",
          href: "/admin/isletme-kayit",
        },
      ],
    },
    {
      title: "Kullanıcı Yönetimi",
      href: "/admin/kullanici-yonetimi",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Ödeme Yönetimi",
      href: "/admin/musteri-yonetimi",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      title: "Bildirimler",
      href: "/admin/bildirimler",
      icon: <Bell className="h-5 w-5" />,
    },
    {
      title: "Görevler",
      href: "/admin/gorevler",
      icon: <CheckSquare className="h-5 w-5" />,
    },
    {
      title: "Raporlar",
      href: "/admin/raporlar",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Ön Başvurular",
      href: "/admin/on-basvurular",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Değişiklik Günlüğü",
      href: "/admin/degisiklik-gunlugu",
      icon: <History className="h-5 w-5" />,
      submenu: false,
    },
    {
      title: "Sistem Logları",
      href: "/admin/sistem-loglari",
      icon: <ActivityLog className="h-5 w-5" />,
    },
    {
      title: "Ayarlar",
      href: "/admin/ayarlar",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  // Satış temsilcisi için sınırlı menü öğeleri
  const salesNavItems = [
    {
      title: "İşletme Listesi",
      href: "/admin/isletme-listesi",
      icon: <ListChecks className="h-5 w-5" />,
    },
    {
      title: "İşletme Ekle",
      href: "/admin/isletme-kayit",
      icon: <PlusCircle className="h-5 w-5" />,
    },
    {
      title: "Bildirimler",
      href: "/admin/bildirimler",
      icon: <Bell className="h-5 w-5" />,
    },
    {
      title: "Görevler",
      href: "/admin/gorevler",
      icon: <CheckSquare className="h-5 w-5" />,
    },
  ]

  // Kullanıcı rolüne göre menü öğelerini belirle
  const navItems = userRole === "sales" ? salesNavItems : adminNavItems

  return (
    <>
      {/* Mobil Menü Butonu */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button variant="outline" size="icon" onClick={toggleMobileMenu} className="bg-white">
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 transition-transform ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo ve Başlık */}
          <div className="flex items-center justify-center h-16 border-b border-gray-200">
            <Shield className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold">Admin Panel</h2>
          </div>

          {/* Kullanıcı Bilgisi */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Hoş geldiniz</p>
                <p className="text-sm text-gray-500 truncate">{userEmail}</p>
                {userRole && (
                  <Badge variant="outline" className="mt-1">
                    {userRole === "admin" ? "Admin" : userRole === "sales" ? "Satış Temsilcisi" : "Kullanıcı"}
                  </Badge>
                )}
              </div>
              <NotificationCenter />
            </div>
          </div>

          {/* Navigasyon */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {navItems.map((item, index) => (
                <li key={index}>
                  {item.submenu ? (
                    <div>
                      <Button
                        variant="ghost"
                        className={`w-full justify-between ${
                          pathname.startsWith("/admin/isletme") ? "bg-gray-100" : ""
                        }`}
                        onClick={toggleSubmenu}
                      >
                        <div className="flex items-center">
                          {item.icon}
                          <span className="ml-3">{item.title}</span>
                        </div>
                        <ChevronDown className={`h-4 w-4 transition-transform ${isSubmenuOpen ? "rotate-180" : ""}`} />
                      </Button>
                      {isSubmenuOpen && (
                        <ul className="mt-2 space-y-1 pl-10">
                          {item.submenu.map((subitem, subindex) => (
                            <li key={subindex}>
                              <Link
                                href={subitem.href}
                                className={`block py-2 px-3 rounded-md text-sm ${
                                  pathname === subitem.href
                                    ? "bg-gray-100 text-blue-600 font-medium"
                                    : "text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                {subitem.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <Link href={item.href}>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start ${pathname === item.href ? "bg-gray-100" : ""}`}
                      >
                        {item.icon}
                        <span className="ml-3">{item.title}</span>
                      </Button>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Çıkış Butonu */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Çıkış Yap
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}

// Badge bileşeni
function Badge({ children, className, variant = "default" }) {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
  const variantClasses = {
    default: "bg-blue-100 text-blue-800",
    outline: "bg-transparent border border-gray-300 text-gray-700",
  }

  return <span className={`${baseClasses} ${variantClasses[variant]} ${className || ""}`}>{children}</span>
}
