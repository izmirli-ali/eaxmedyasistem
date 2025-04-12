"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import type { Task, TaskPriority, TaskStatus } from "@/types/task"
import { Badge } from "@/components/ui/badge"
import { Plus, CalendarIcon, Search, AlertCircle, Loader2, CheckCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function GorevlerPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [users, setUsers] = useState<{ id: string; ad_soyad: string }[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending" as TaskStatus,
    priority: "medium" as TaskPriority,
    due_date: "",
    assigned_to: "",
    related_id: "",
    related_type: "",
  })

  const supabase = createClient()

  // Görevleri ve kullanıcıları yükle
  useEffect(() => {
    async function loadTasksAndUsers() {
      try {
        setLoading(true)

        // Kullanıcıları getir
        const { data: userData, error: userError } = await supabase.from("kullanicilar").select("id, ad_soyad")

        if (userError) throw userError
        setUsers(userData || [])

        // Görevleri getir
        const { data: taskData, error: taskError } = await supabase
          .from("tasks")
          .select("*")
          .order("created_at", { ascending: false })

        if (taskError) throw taskError
        setTasks(taskData || [])
        setFilteredTasks(taskData || [])
      } catch (error) {
        console.error("Veriler yüklenirken hata:", error)
        toast({
          title: "Hata",
          description: "Veriler yüklenirken bir hata oluştu.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadTasksAndUsers()
  }, [supabase, toast])

  // Filtreleme
  useEffect(() => {
    let result = tasks

    // Arama filtresi
    if (searchTerm) {
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Durum filtresi
    if (statusFilter !== "all") {
      result = result.filter((task) => task.status === statusFilter)
    }

    // Öncelik filtresi
    if (priorityFilter !== "all") {
      result = result.filter((task) => task.priority === priorityFilter)
    }

    setFilteredTasks(result)
  }, [searchTerm, statusFilter, priorityFilter, tasks])

  // Form değişikliklerini işle
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Select değişikliklerini işle
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Tarih değişikliklerini işle
  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      due_date: date ? format(date, "yyyy-MM-dd") : "",
    }))
  }

  // Görev ekle
  const handleAddTask = async () => {
    try {
      if (!formData.title) {
        toast({
          title: "Hata",
          description: "Görev başlığı zorunludur.",
          variant: "destructive",
        })
        return
      }

      setLoading(true)

      // Kullanıcı bilgilerini al
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        throw new Error("Oturum bulunamadı")
      }

      const now = new Date().toISOString()

      // Görev ekle
      const { data, error } = await supabase
        .from("tasks")
        .insert([
          {
            title: formData.title,
            description: formData.description,
            status: formData.status,
            priority: formData.priority,
            due_date: formData.due_date || null,
            assigned_to: formData.assigned_to === "unassigned" ? null : formData.assigned_to,
            assigned_by: session.session.user.id,
            related_id: formData.related_id || null,
            related_type: formData.related_type || null,
            created_at: now,
            updated_at: now,
          },
        ])
        .select()

      if (error) throw error

      // Atanan kişiye bildirim gönder
      if (formData.assigned_to) {
        await supabase.from("notifications").insert([
          {
            user_id: formData.assigned_to,
            type: "task_assigned",
            title: "Yeni Görev Atandı",
            message: `Size "${formData.title}" başlıklı yeni bir görev atandı.`,
            related_id: data[0].id,
            related_type: "task",
            is_read: false,
            created_at: now,
          },
        ])
      }

      // Görevleri yeniden yükle
      const { data: updatedTasks, error: fetchError } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError

      setTasks(updatedTasks || [])

      // Formu sıfırla ve dialogu kapat
      setFormData({
        title: "",
        description: "",
        status: "pending",
        priority: "medium",
        due_date: "",
        assigned_to: "",
        related_id: "",
        related_type: "",
      })

      setIsAddDialogOpen(false)

      toast({
        title: "Başarılı",
        description: "Görev başarıyla eklendi.",
      })
    } catch (error) {
      console.error("Görev eklenirken hata:", error)
      toast({
        title: "Hata",
        description: "Görev eklenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Görev düzenleme için dialogu aç
  const openEditDialog = (task: Task) => {
    setSelectedTask(task)
    setFormData({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      due_date: task.due_date || "",
      assigned_to: task.assigned_to || "unassigned",
      related_id: task.related_id || "",
      related_type: task.related_type || "",
    })
    setIsEditDialogOpen(true)
  }

  // Görev düzenle
  const handleEditTask = async () => {
    if (!selectedTask) return

    try {
      if (!formData.title) {
        toast({
          title: "Hata",
          description: "Görev başlığı zorunludur.",
          variant: "destructive",
        })
        return
      }

      setLoading(true)

      const now = new Date().toISOString()
      const updates: any = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        due_date: formData.due_date || null,
        assigned_to: formData.assigned_to === "unassigned" ? null : formData.assigned_to,
        related_id: formData.related_id || null,
        related_type: formData.related_type || null,
        updated_at: now,
      }

      // Eğer görev tamamlandıysa tamamlanma tarihini ekle
      if (formData.status === "completed" && selectedTask.status !== "completed") {
        updates.completed_at = now
      } else if (formData.status !== "completed") {
        updates.completed_at = null
      }

      // Görevi güncelle
      const { error } = await supabase.from("tasks").update(updates).eq("id", selectedTask.id)

      if (error) throw error

      // Atanan kişi değiştiyse bildirim gönder
      if (formData.assigned_to && formData.assigned_to !== selectedTask.assigned_to) {
        await supabase.from("notifications").insert([
          {
            user_id: formData.assigned_to,
            type: "task_assigned",
            title: "Görev Size Atandı",
            message: `"${formData.title}" başlıklı görev size atandı.`,
            related_id: selectedTask.id,
            related_type: "task",
            is_read: false,
            created_at: now,
          },
        ])
      }

      // Görevleri yeniden yükle
      const { data: updatedTasks, error: fetchError } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError

      setTasks(updatedTasks || [])

      // Formu sıfırla ve dialogu kapat
      setSelectedTask(null)
      setIsEditDialogOpen(false)

      toast({
        title: "Başarılı",
        description: "Görev başarıyla güncellendi.",
      })
    } catch (error) {
      console.error("Görev güncellenirken hata:", error)
      toast({
        title: "Hata",
        description: "Görev güncellenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Görev durumunu hızlıca güncelle
  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      setLoading(true)

      const now = new Date().toISOString()
      const updates: any = {
        status,
        updated_at: now,
      }

      // Eğer görev tamamlandıysa tamamlanma tarihini ekle
      if (status === "completed") {
        updates.completed_at = now
      } else {
        updates.completed_at = null
      }

      // Görevi güncelle
      const { error } = await supabase.from("tasks").update(updates).eq("id", taskId)

      if (error) throw error

      // Görevleri yeniden yükle
      const { data: updatedTasks, error: fetchError } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError

      setTasks(updatedTasks || [])

      toast({
        title: "Başarılı",
        description: "Görev durumu güncellendi.",
      })
    } catch (error) {
      console.error("Görev durumu güncellenirken hata:", error)
      toast({
        title: "Hata",
        description: "Görev durumu güncellenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Kullanıcı adını getir
  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    return user ? user.ad_soyad : "Bilinmeyen Kullanıcı"
  }

  // Öncelik badge'i
  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case "low":
        return <Badge className="bg-blue-100 text-blue-800">Düşük</Badge>
      case "medium":
        return <Badge className="bg-green-100 text-green-800">Orta</Badge>
      case "high":
        return <Badge className="bg-orange-100 text-orange-800">Yüksek</Badge>
      case "urgent":
        return <Badge className="bg-red-100 text-red-800">Acil</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{priority}</Badge>
    }
  }

  // Durum badge'i
  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Beklemede</Badge>
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800">Devam Ediyor</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Tamamlandı</Badge>
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800">İptal Edildi</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Görev Yönetimi</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Görev Ekle
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Görev Listesi</CardTitle>
          <CardDescription>Tüm görevleri görüntüleyin ve yönetin.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Görev ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Durum Filtresi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="pending">Beklemede</SelectItem>
                  <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                  <SelectItem value="cancelled">İptal Edildi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Öncelik Filtresi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Öncelikler</SelectItem>
                  <SelectItem value="low">Düşük</SelectItem>
                  <SelectItem value="medium">Orta</SelectItem>
                  <SelectItem value="high">Yüksek</SelectItem>
                  <SelectItem value="urgent">Acil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Görev</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Öncelik</TableHead>
                    <TableHead>Atanan Kişi</TableHead>
                    <TableHead>Bitiş Tarihi</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{task.title}</p>
                            {task.description && (
                              <p className="text-sm text-gray-500 truncate max-w-xs">{task.description}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(task.status)}</TableCell>
                        <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                        <TableCell>{task.assigned_to ? getUserName(task.assigned_to) : "-"}</TableCell>
                        <TableCell>
                          {task.due_date ? format(new Date(task.due_date), "dd MMMM yyyy", { locale: tr }) : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(task)}>
                              Düzenle
                            </Button>
                            {task.status !== "completed" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                                onClick={() => updateTaskStatus(task.id, "completed")}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Tamamla
                              </Button>
                            )}
                            {task.status === "completed" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-yellow-50 text-yellow-600 hover:bg-yellow-100 hover:text-yellow-700"
                                onClick={() => updateTaskStatus(task.id, "pending")}
                              >
                                <AlertCircle className="h-4 w-4 mr-1" />
                                Yeniden Aç
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                          ? "Arama kriterlerine uygun görev bulunamadı"
                          : "Henüz görev bulunmuyor"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Görev Ekleme Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni Görev Ekle</DialogTitle>
            <DialogDescription>Yeni bir görev eklemek için aşağıdaki formu doldurun.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Görev Başlığı</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Görev başlığını girin"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Görev açıklamasını girin"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Öncelik</Label>
                <Select value={formData.priority} onValueChange={(value) => handleSelectChange("priority", value)}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Öncelik seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="medium">Orta</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                    <SelectItem value="urgent">Acil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Durum</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Durum seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Beklemede</SelectItem>
                    <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                    <SelectItem value="completed">Tamamlandı</SelectItem>
                    <SelectItem value="cancelled">İptal Edildi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">Bitiş Tarihi</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.due_date ? (
                      format(new Date(formData.due_date), "dd MMMM yyyy", { locale: tr })
                    ) : (
                      <span>Tarih seçin</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.due_date ? new Date(formData.due_date) : undefined}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assigned_to">Atanan Kişi</Label>
              <Select value={formData.assigned_to} onValueChange={(value) => handleSelectChange("assigned_to", value)}>
                <SelectTrigger id="assigned_to">
                  <SelectValue placeholder="Kişi seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Atanmamış</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.ad_soyad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              İptal
            </Button>
            <Button type="button" onClick={handleAddTask} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ekleniyor...
                </>
              ) : (
                "Ekle"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Görev Düzenleme Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Görev Düzenle</DialogTitle>
            <DialogDescription>Görev bilgilerini güncellemek için aşağıdaki formu doldurun.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Görev Başlığı</Label>
              <Input
                id="edit-title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Görev başlığını girin"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Açıklama</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Görev açıklamasını girin"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-priority">Öncelik</Label>
                <Select value={formData.priority} onValueChange={(value) => handleSelectChange("priority", value)}>
                  <SelectTrigger id="edit-priority">
                    <SelectValue placeholder="Öncelik seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="medium">Orta</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                    <SelectItem value="urgent">Acil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Durum</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Durum seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Beklemede</SelectItem>
                    <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                    <SelectItem value="completed">Tamamlandı</SelectItem>
                    <SelectItem value="cancelled">İptal Edildi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-due_date">Bitiş Tarihi</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.due_date ? (
                      format(new Date(formData.due_date), "dd MMMM yyyy", { locale: tr })
                    ) : (
                      <span>Tarih seçin</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.due_date ? new Date(formData.due_date) : undefined}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-assigned_to">Atanan Kişi</Label>
              <Select value={formData.assigned_to} onValueChange={(value) => handleSelectChange("assigned_to", value)}>
                <SelectTrigger id="edit-assigned_to">
                  <SelectValue placeholder="Kişi seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Atanmamış</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.ad_soyad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              İptal
            </Button>
            <Button type="button" onClick={handleEditTask} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Güncelleniyor...
                </>
              ) : (
                "Güncelle"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
