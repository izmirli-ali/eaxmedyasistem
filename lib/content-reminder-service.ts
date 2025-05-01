/**
 * İçerik Güncelliği Hatırlatma Servisi
 * Bu servis, işletme bilgilerinin güncel kalması için otomatik hatırlatmalar oluşturur
 */

import { createClient } from "@/lib/supabase/client"
import { v4 as uuidv4 } from "uuid"

// Hatırlatma türleri
export enum ReminderType {
  BUSINESS_INFO_UPDATE = "business_info_update",
  PHOTO_UPDATE = "photo_update",
  OPENING_HOURS_CHECK = "opening_hours_check",
  SERVICES_UPDATE = "services_update",
  CONTACT_INFO_CHECK = "contact_info_check",
  DESCRIPTION_UPDATE = "description_update",
  REVIEW_RESPONSE = "review_response",
  GOOGLE_POSTS = "google_posts",
  SEO_OPTIMIZATION = "seo_optimization",
}

// Hatırlatma durumları
export enum ReminderStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  DISMISSED = "dismissed",
  OVERDUE = "overdue",
}

// Hatırlatma önceliği
export enum ReminderPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

// Hatırlatma bilgisi tipi
export interface ReminderInfo {
  id: string
  user_id: string
  isletme_id: string
  type: ReminderType
  title: string
  description: string
  status: ReminderStatus
  priority: ReminderPriority
  due_date: string
  created_at: string
  updated_at: string
  completed_at?: string
  dismissed_at?: string
  recurrence?: string // "daily", "weekly", "monthly", "quarterly", "yearly"
  metadata?: Record<string, any>
}

/**
 * İçerik Güncelliği Hatırlatma Servisi
 */
export class ContentReminderService {
  private static instance: ContentReminderService
  private supabase = createClient()

  private constructor() {}

  public static getInstance(): ContentReminderService {
    if (!ContentReminderService.instance) {
      ContentReminderService.instance = new ContentReminderService()
    }
    return ContentReminderService.instance
  }

  /**
   * Yeni bir hatırlatma oluşturur
   */
  public async createReminder(
    userId: string,
    isletmeId: string,
    type: ReminderType,
    title: string,
    description: string,
    priority: ReminderPriority = ReminderPriority.MEDIUM,
    dueDate: Date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Varsayılan olarak 1 hafta sonra
    recurrence?: string,
    metadata?: Record<string, any>,
  ): Promise<ReminderInfo> {
    try {
      const reminderId = uuidv4()
      const now = new Date().toISOString()

      const reminderData: ReminderInfo = {
        id: reminderId,
        user_id: userId,
        isletme_id: isletmeId,
        type,
        title,
        description,
        status: ReminderStatus.PENDING,
        priority,
        due_date: dueDate.toISOString(),
        created_at: now,
        updated_at: now,
        recurrence,
        metadata,
      }

      const { error } = await this.supabase.from("content_reminders").insert([reminderData])

      if (error) throw error

      return reminderData
    } catch (error) {
      console.error("Hatırlatma oluşturulurken hata:", error)
      throw error
    }
  }

  /**
   * Hatırlatma durumunu günceller
   */
  public async updateReminderStatus(
    reminderId: string,
    status: ReminderStatus,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      const now = new Date().toISOString()
      const updateData: any = {
        status,
        updated_at: now,
      }

      if (metadata) {
        updateData.metadata = metadata
      }

      if (status === ReminderStatus.COMPLETED) {
        updateData.completed_at = now
      } else if (status === ReminderStatus.DISMISSED) {
        updateData.dismissed_at = now
      }

      const { error } = await this.supabase.from("content_reminders").update(updateData).eq("id", reminderId)

      if (error) throw error

      // Eğer tekrarlanan bir hatırlatma ise ve tamamlandıysa, yeni bir hatırlatma oluştur
      if (status === ReminderStatus.COMPLETED) {
        const { data: reminderData, error: fetchError } = await this.supabase
          .from("content_reminders")
          .select("*")
          .eq("id", reminderId)
          .single()

        if (fetchError) throw fetchError

        if (reminderData.recurrence) {
          await this.createRecurringReminder(reminderData)
        }
      }
    } catch (error) {
      console.error("Hatırlatma durumu güncellenirken hata:", error)
      throw error
    }
  }

  /**
   * Tekrarlanan hatırlatma oluşturur
   */
  private async createRecurringReminder(reminderData: ReminderInfo): Promise<void> {
    try {
      const dueDate = new Date(reminderData.due_date)
      let nextDueDate: Date

      // Tekrarlama türüne göre bir sonraki tarihi hesapla
      switch (reminderData.recurrence) {
        case "daily":
          nextDueDate = new Date(dueDate.setDate(dueDate.getDate() + 1))
          break
        case "weekly":
          nextDueDate = new Date(dueDate.setDate(dueDate.getDate() + 7))
          break
        case "monthly":
          nextDueDate = new Date(dueDate.setMonth(dueDate.getMonth() + 1))
          break
        case "quarterly":
          nextDueDate = new Date(dueDate.setMonth(dueDate.getMonth() + 3))
          break
        case "yearly":
          nextDueDate = new Date(dueDate.setFullYear(dueDate.getFullYear() + 1))
          break
        default:
          return // Geçersiz tekrarlama türü
      }

      // Yeni hatırlatma oluştur
      await this.createReminder(
        reminderData.user_id,
        reminderData.isletme_id,
        reminderData.type as ReminderType,
        reminderData.title,
        reminderData.description,
        reminderData.priority as ReminderPriority,
        nextDueDate,
        reminderData.recurrence,
        reminderData.metadata,
      )
    } catch (error) {
      console.error("Tekrarlanan hatırlatma oluşturulurken hata:", error)
      throw error
    }
  }

  /**
   * Kullanıcının hatırlatmalarını listeler
   */
  public async listReminders(userId: string, status?: ReminderStatus, isletmeId?: string): Promise<ReminderInfo[]> {
    try {
      let query = this.supabase.from("content_reminders").select("*").eq("user_id", userId)

      if (status) {
        query = query.eq("status", status)
      }

      if (isletmeId) {
        query = query.eq("isletme_id", isletmeId)
      }

      const { data, error } = await query.order("due_date", { ascending: true })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error("Hatırlatmalar listelenirken hata:", error)
      throw error
    }
  }

  /**
   * Vadesi geçmiş hatırlatmaları günceller
   */
  public async updateOverdueReminders(): Promise<void> {
    try {
      const now = new Date().toISOString()

      const { error } = await this.supabase
        .from("content_reminders")
        .update({
          status: ReminderStatus.OVERDUE,
          updated_at: now,
        })
        .eq("status", ReminderStatus.PENDING)
        .lt("due_date", now)

      if (error) throw error
    } catch (error) {
      console.error("Vadesi geçmiş hatırlatmalar güncellenirken hata:", error)
      throw error
    }
  }

  // createAutomaticReminders fonksiyonunu düzelt
  public async createAutomaticReminders(isletmeId: string, userId: string): Promise<void> {
    try {
      // İşletme bilgilerini al
      const { data: isletmeData, error: isletmeError } = await this.supabase
        .from("isletmeler")
        .select("*")
        .eq("id", isletmeId)
        .single()

      if (isletmeError) throw isletmeError

      // Her tarih hesaplaması için yeni Date nesneleri oluştur
      const now = new Date()

      // Bir ay sonrası için yeni bir Date nesnesi
      const oneMonthLater = new Date()
      oneMonthLater.setMonth(now.getMonth() + 1)

      // Üç ay sonrası için yeni bir Date nesnesi
      const threeMonthsLater = new Date()
      threeMonthsLater.setMonth(now.getMonth() + 3)

      // Altı ay sonrası için yeni bir Date nesnesi
      const sixMonthsLater = new Date()
      sixMonthsLater.setMonth(now.getMonth() + 6)

      // Bir hafta sonrası için yeni bir Date nesnesi
      const oneWeekLater = new Date()
      oneWeekLater.setDate(now.getDate() + 7)

      // Genel bilgi güncelleme hatırlatması (3 ayda bir)
      await this.createReminder(
        userId,
        isletmeId,
        ReminderType.BUSINESS_INFO_UPDATE,
        "İşletme Bilgilerini Güncelle",
        "İşletme bilgilerinizi gözden geçirin ve güncelleyin. Güncel bilgiler, Google Haritalar'da daha iyi sıralama almanıza yardımcı olur.",
        ReminderPriority.MEDIUM,
        threeMonthsLater,
        "quarterly",
      )

      // Fotoğraf güncelleme hatırlatması (6 ayda bir)
      await this.createReminder(
        userId,
        isletmeId,
        ReminderType.PHOTO_UPDATE,
        "İşletme Fotoğraflarını Güncelle",
        "İşletme fotoğraflarınızı güncelleyin. Güncel ve kaliteli fotoğraflar, müşterilerin ilgisini çekmenize yardımcı olur.",
        ReminderPriority.MEDIUM,
        sixMonthsLater,
        "yearly",
      )

      // Çalışma saatleri kontrol hatırlatması (3 ayda bir)
      await this.createReminder(
        userId,
        isletmeId,
        ReminderType.OPENING_HOURS_CHECK,
        "Çalışma Saatlerini Kontrol Et",
        "Çalışma saatlerinizi kontrol edin ve güncelleyin. Doğru çalışma saatleri, müşterilerin işletmenizi ziyaret etme olasılığını artırır.",
        ReminderPriority.HIGH,
        threeMonthsLater,
        "quarterly",
      )

      // Hizmetler güncelleme hatırlatması (3 ayda bir)
      await this.createReminder(
        userId,
        isletmeId,
        ReminderType.SERVICES_UPDATE,
        "Sunulan Hizmetleri Güncelle",
        "Sunduğunuz hizmetleri gözden geçirin ve güncelleyin. Güncel hizmet bilgileri, müşterilerin işletmenizi tercih etmesine yardımcı olur.",
        ReminderPriority.MEDIUM,
        threeMonthsLater,
        "quarterly",
      )

      // İletişim bilgileri kontrol hatırlatması (ayda bir)
      await this.createReminder(
        userId,
        isletmeId,
        ReminderType.CONTACT_INFO_CHECK,
        "İletişim Bilgilerini Kontrol Et",
        "İletişim bilgilerinizi kontrol edin ve güncelleyin. Doğru iletişim bilgileri, müşterilerin size ulaşmasını kolaylaştırır.",
        ReminderPriority.HIGH,
        oneMonthLater,
        "monthly",
      )

      // Açıklama güncelleme hatırlatması (6 ayda bir)
      await this.createReminder(
        userId,
        isletmeId,
        ReminderType.DESCRIPTION_UPDATE,
        "İşletme Açıklamasını Güncelle",
        "İşletme açıklamanızı gözden geçirin ve güncelleyin. Güncel ve detaylı bir açıklama, müşterilerin işletmeniz hakkında daha fazla bilgi edinmesine yardımcı olur.",
        ReminderPriority.MEDIUM,
        sixMonthsLater,
        "yearly",
      )

      // Yorum yanıtlama hatırlatması (haftalık)
      await this.createReminder(
        userId,
        isletmeId,
        ReminderType.REVIEW_RESPONSE,
        "Müşteri Yorumlarını Yanıtla",
        "Müşteri yorumlarını kontrol edin ve yanıtlayın. Yorumlara yanıt vermek, müşteri memnuniyetini artırır ve işletmenizin itibarını güçlendirir.",
        ReminderPriority.HIGH,
        oneWeekLater,
        "weekly",
      )

      // Google gönderileri hatırlatması (haftalık)
      await this.createReminder(
        userId,
        isletmeId,
        ReminderType.GOOGLE_POSTS,
        "Google Business Profile'da Gönderi Paylaş",
        "Google Business Profile'da yeni bir gönderi paylaşın. Düzenli gönderiler, işletmenizin görünürlüğünü artırır ve müşterilerle etkileşimi güçlendirir.",
        ReminderPriority.MEDIUM,
        oneWeekLater,
        "weekly",
      )

      // SEO optimizasyonu hatırlatması (3 ayda bir)
      await this.createReminder(
        userId,
        isletmeId,
        ReminderType.SEO_OPTIMIZATION,
        "SEO Bilgilerini Optimize Et",
        "SEO başlığı, açıklaması ve anahtar kelimelerini gözden geçirin ve optimize edin. İyi optimize edilmiş SEO bilgileri, işletmenizin arama motorlarında daha iyi sıralama almasına yardımcı olur.",
        ReminderPriority.MEDIUM,
        threeMonthsLater,
        "quarterly",
      )
    } catch (error) {
      console.error("Otomatik hatırlatmalar oluşturulurken hata:", error)
      throw error
    }
  }

  /**
   * Yaklaşan hatırlatmaları kontrol eder ve bildirim gönderir
   */
  public async checkUpcomingReminders(): Promise<void> {
    try {
      const now = new Date()
      const tomorrow = new Date(now.setDate(now.getDate() + 1))

      // Yarın vadesi dolacak hatırlatmaları al
      const { data, error } = await this.supabase
        .from("content_reminders")
        .select("*")
        .eq("status", ReminderStatus.PENDING)
        .lt("due_date", tomorrow.toISOString())
        .gt("due_date", now.toISOString())

      if (error) throw error

      // Her hatırlatma için bildirim oluştur
      for (const reminder of data || []) {
        await this.supabase.from("notifications").insert([
          {
            user_id: reminder.user_id,
            title: `Hatırlatma: ${reminder.title}`,
            content: reminder.description,
            type: "reminder",
            is_read: false,
            metadata: {
              reminder_id: reminder.id,
              isletme_id: reminder.isletme_id,
              reminder_type: reminder.type,
            },
          },
        ])
      }
    } catch (error) {
      console.error("Yaklaşan hatırlatmalar kontrol edilirken hata:", error)
      throw error
    }
  }
}
