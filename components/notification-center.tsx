"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import Link from "next/link"

// Bildirim tipi
type NotificationType = "info" | "warning" | "success" | "error"

// Bildirim arayüzü
interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  is_read: boolean
  related_to?: string
  related_id?: string
  created_at: string
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Supabase istemcisini oluştur
  const supabase = createClient()

  // Bildirimleri yükle
  const loadNotifications = async () => {
    try {
      setLoading(true)

      // Kullanıcı ID'sini al
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData.session?.user.id

      if (!userId) {
        return
      }

      // Bildirimleri getir (son 5 bildirim)
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5)

      if (error) throw error

      setNotifications(data || [])
      setUnreadCount(data?.filter((n) => !n.is_read).length || 0)
    } catch (error) {
      console.error("Bildirimler yüklenirken hata:", error)
    } finally {
      setLoading(false)
    }
  }

  // Sayfa yüklendiğinde bildirimleri getir
  useEffect(() => {
    loadNotifications()

    // Gerçek zamanlı bildirim güncellemeleri için abonelik
    const channel = supabase
      .channel("notification_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        () => {
          loadNotifications()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Bildirimi okundu olarak işaretle
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId)

      if (error) throw error

      // Bildirimleri güncelle
      setNotifications(
        notifications.map((notification) =>
          notification.id === notificationId ? { ...notification, is_read: true } : notification,
        ),
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Bildirim işaretlenirken hata:", error)
    }
  }

  // Bildirim tipine göre renk
  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case "info":
        return "bg-blue-50 border-blue-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      case "success":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white">{unreadCount}</Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Bildirimler</h3>
            <Link href="/admin/bildirimler">
              <Button variant="ghost" size="sm">
                Tümünü Gör
              </Button>
            </Link>
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Yükleniyor...</div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-gray-100 ${
                  notification.is_read ? "" : getNotificationColor(notification.type)
                }`}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  <span className="text-xs text-gray-500">
                    {format(new Date(notification.created_at), "HH:mm", { locale: tr })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                {!notification.is_read && (
                  <div className="mt-2 text-right">
                    <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                      Okundu İşaretle
                    </Button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">Bildirim bulunmuyor</div>
          )}
        </div>
        <div className="p-2 border-t border-gray-200">
          <Link href="/admin/bildirimler" className="block">
            <Button variant="outline" size="sm" className="w-full">
              Tüm Bildirimleri Görüntüle
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
