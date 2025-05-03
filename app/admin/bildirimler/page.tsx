"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, CheckCircle, RefreshCw, AlertCircle, Eye } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

// Bildirim tipi
type NotificationType = "info" | "warning" | "success" | "error" | "system" | "business_added"

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
  related_type?: string
  created_at: string
}

export default function BildirimlerPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [error, setError] = useState<string | null>(null)

  // Supabase istemcisini oluştur
  const supabase = createClient()

  // Bildirimleri yükle
  const loadNotifications = async () => {
    try {
      setLoading(true)
      setError(null)

      // Kullanıcı ID'sini al
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData.session?.user.id

      if (!userId) {
        throw new Error("Kullanıcı oturumu bulunamadı")
      }

      // Bildirimleri getir
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error

      setNotifications(data || [])
    } catch (error) {
      console.error("Bildirimler yüklenirken hata:", error)
      setError("Bildirimler yüklenirken bir hata oluştu: " + error.message)
      toast({
        title: "Hata",
        description: "Bildirimler yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
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

      toast({
        title: "Başarılı",
        description: "Bildirim okundu olarak işaretlendi.",
      })
    } catch (error) {
      console.error("Bildirim işaretlenirken hata:", error)
      toast({
        title: "Hata",
        description: "Bildirim işaretlenirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  // Tüm bildirimleri okundu olarak işaretle
  const markAllAsRead = async () => {
    try {
      // Kullanıcı ID'sini al
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData.session?.user.id

      if (!userId) {
        throw new Error("Kullanıcı oturumu bulunamadı")
      }

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false)

      if (error) throw error

      // Bildirimleri güncelle
      setNotifications(notifications.map((notification) => ({ ...notification, is_read: true })))

      toast({
        title: "Başarılı",
        description: "Tüm bildirimler okundu olarak işaretlendi.",
      })
    } catch (error) {
      console.error("Bildirimler işaretlenirken hata:", error)
      toast({
        title: "Hata",
        description: "Bildirimler işaretlenirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  // Bildirim tipine göre badge rengi
  const getNotificationBadge = (type: NotificationType) => {
    switch (type) {
      case "info":
        return <Badge className="bg-blue-100 text-blue-800">Bilgi</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Uyarı</Badge>
      case "success":
        return <Badge className="bg-green-100 text-green-800">Başarılı</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800">Hata</Badge>
      case "system":
        return <Badge className="bg-purple-100 text-purple-800">Sistem</Badge>
      case "business_added":
        return <Badge className="bg-emerald-100 text-emerald-800">Yeni İşletme</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{type}</Badge>
    }
  }

  // İlgili sayfaya yönlendirme URL'i
  const getRelatedUrl = (notification: Notification) => {
    if (notification.related_type === "on_basvuru") {
      return "/admin/on-basvurular"
    } else if (notification.related_type === "isletme") {
      return `/admin/isletme-duzenle/${notification.related_id}`
    } else if (notification.related_to === "isletme") {
      return `/admin/isletme/${notification.related_id}`
    } else if (notification.related_to === "musteri") {
      return `/admin/musteri-yonetimi?id=${notification.related_id}`
    } else if (notification.related_to === "gorev") {
      return `/admin/gorevler?id=${notification.related_id}`
    }
    return null
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bildirimler</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadNotifications} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Yenile
          </Button>
          <Button onClick={markAllAsRead} disabled={loading || notifications.every((n) => n.is_read)}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Tümünü Okundu İşaretle
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Hata</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            Tüm Bildirimler
            {notifications.length > 0 && (
              <Badge className="ml-2 bg-gray-200 text-gray-800">{notifications.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread">
            Okunmamış
            {notifications.filter((n) => !n.is_read).length > 0 && (
              <Badge className="ml-2 bg-red-100 text-red-800">{notifications.filter((n) => !n.is_read).length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="system">
            Sistem
            {notifications.filter((n) => n.type === "system").length > 0 && (
              <Badge className="ml-2 bg-purple-100 text-purple-800">
                {notifications.filter((n) => n.type === "system").length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="business">
            İşletmeler
            {notifications.filter((n) => n.type === "business_added").length > 0 && (
              <Badge className="ml-2 bg-emerald-100 text-emerald-800">
                {notifications.filter((n) => n.type === "business_added").length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Tüm Bildirimler</CardTitle>
              <CardDescription>Sistemdeki tüm bildirimlerinizi görüntüleyin.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tarih</TableHead>
                        <TableHead>Başlık</TableHead>
                        <TableHead>Mesaj</TableHead>
                        <TableHead>Tip</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead className="text-right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <TableRow key={notification.id} className={notification.is_read ? "" : "bg-blue-50"}>
                            <TableCell>
                              {format(new Date(notification.created_at), "dd MMMM yyyy HH:mm", {
                                locale: tr,
                              })}
                            </TableCell>
                            <TableCell className="font-medium">{notification.title}</TableCell>
                            <TableCell>{notification.message}</TableCell>
                            <TableCell>{getNotificationBadge(notification.type)}</TableCell>
                            <TableCell>
                              {notification.is_read ? (
                                <Badge className="bg-gray-100 text-gray-800">Okundu</Badge>
                              ) : (
                                <Badge className="bg-blue-100 text-blue-800">Okunmadı</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {!notification.is_read && (
                                  <Button variant="outline" size="sm" onClick={() => markAsRead(notification.id)}>
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                )}
                                {getRelatedUrl(notification) && (
                                  <Link href={getRelatedUrl(notification) as string}>
                                    <Button variant="outline" size="sm">
                                      <Eye className="mr-2 h-4 w-4" />
                                      Görüntüle
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            Bildirim bulunmuyor
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread">
          <Card>
            <CardHeader>
              <CardTitle>Okunmamış Bildirimler</CardTitle>
              <CardDescription>Henüz okumadığınız bildirimleri görüntüleyin.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tarih</TableHead>
                        <TableHead>Başlık</TableHead>
                        <TableHead>Mesaj</TableHead>
                        <TableHead>Tip</TableHead>
                        <TableHead className="text-right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notifications.filter((n) => !n.is_read).length > 0 ? (
                        notifications
                          .filter((n) => !n.is_read)
                          .map((notification) => (
                            <TableRow key={notification.id} className="bg-blue-50">
                              <TableCell>
                                {format(new Date(notification.created_at), "dd MMMM yyyy HH:mm", {
                                  locale: tr,
                                })}
                              </TableCell>
                              <TableCell className="font-medium">{notification.title}</TableCell>
                              <TableCell>{notification.message}</TableCell>
                              <TableCell>{getNotificationBadge(notification.type)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" size="sm" onClick={() => markAsRead(notification.id)}>
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  {getRelatedUrl(notification) && (
                                    <Link href={getRelatedUrl(notification) as string}>
                                      <Button variant="outline" size="sm">
                                        <Eye className="mr-2 h-4 w-4" />
                                        Görüntüle
                                      </Button>
                                    </Link>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            Okunmamış bildirim bulunmuyor
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>Sistem Bildirimleri</CardTitle>
              <CardDescription>Sistem tarafından oluşturulan bildirimleri görüntüleyin.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tarih</TableHead>
                        <TableHead>Başlık</TableHead>
                        <TableHead>Mesaj</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead className="text-right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notifications.filter((n) => n.type === "system").length > 0 ? (
                        notifications
                          .filter((n) => n.type === "system")
                          .map((notification) => (
                            <TableRow key={notification.id} className={notification.is_read ? "" : "bg-blue-50"}>
                              <TableCell>
                                {format(new Date(notification.created_at), "dd MMMM yyyy HH:mm", {
                                  locale: tr,
                                })}
                              </TableCell>
                              <TableCell className="font-medium">{notification.title}</TableCell>
                              <TableCell>{notification.message}</TableCell>
                              <TableCell>
                                {notification.is_read ? (
                                  <Badge className="bg-gray-100 text-gray-800">Okundu</Badge>
                                ) : (
                                  <Badge className="bg-blue-100 text-blue-800">Okunmadı</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  {!notification.is_read && (
                                    <Button variant="outline" size="sm" onClick={() => markAsRead(notification.id)}>
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {getRelatedUrl(notification) && (
                                    <Link href={getRelatedUrl(notification) as string}>
                                      <Button variant="outline" size="sm">
                                        <Eye className="mr-2 h-4 w-4" />
                                        Görüntüle
                                      </Button>
                                    </Link>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            Sistem bildirimi bulunmuyor
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>İşletme Bildirimleri</CardTitle>
              <CardDescription>İşletmelerle ilgili bildirimleri görüntüleyin.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tarih</TableHead>
                        <TableHead>Başlık</TableHead>
                        <TableHead>Mesaj</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead className="text-right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notifications.filter((n) => n.type === "business_added").length > 0 ? (
                        notifications
                          .filter((n) => n.type === "business_added")
                          .map((notification) => (
                            <TableRow key={notification.id} className={notification.is_read ? "" : "bg-blue-50"}>
                              <TableCell>
                                {format(new Date(notification.created_at), "dd MMMM yyyy HH:mm", {
                                  locale: tr,
                                })}
                              </TableCell>
                              <TableCell className="font-medium">{notification.title}</TableCell>
                              <TableCell>{notification.message}</TableCell>
                              <TableCell>
                                {notification.is_read ? (
                                  <Badge className="bg-gray-100 text-gray-800">Okundu</Badge>
                                ) : (
                                  <Badge className="bg-blue-100 text-blue-800">Okunmadı</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  {!notification.is_read && (
                                    <Button variant="outline" size="sm" onClick={() => markAsRead(notification.id)}>
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {getRelatedUrl(notification) && (
                                    <Link href={getRelatedUrl(notification) as string}>
                                      <Button variant="outline" size="sm">
                                        <Eye className="mr-2 h-4 w-4" />
                                        Görüntüle
                                      </Button>
                                    </Link>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            İşletme bildirimi bulunmuyor
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
