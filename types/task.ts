export type TaskPriority = "low" | "medium" | "high" | "urgent"
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled"

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  due_date?: string
  assigned_to?: string
  assigned_by: string
  related_id?: string
  related_type?: string
  created_at: string
  updated_at: string
  completed_at?: string
}
