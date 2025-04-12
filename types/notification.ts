export type NotificationType =
  | "payment_due" // Ödeme yaklaşıyor
  | "contract_expiring" // Sözleşme bitiyor
  | "task_assigned" // Görev atandı
  | "task_due" // Görev tarihi yaklaşıyor
  | "system" // Sistem bildirimi
  | "backup_completed" // Yedekleme tamamlandı
  | "customer_added" // Yeni müşteri eklendi
  | "business_added" // Yeni işletme eklendi

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  related_id?: string // İlgili öğenin ID'si (işletme, müşteri, görev vb.)
  related_type?: string // İlgili öğenin tipi
  is_read: boolean
  created_at: string
}
