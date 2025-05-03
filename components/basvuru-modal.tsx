"use client"
import { BasvuruFormModal } from "./basvuru-form-modal"

interface BasvuruModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paketTipi?: string
}

export function BasvuruModal({ open, onOpenChange, paketTipi = "" }: BasvuruModalProps) {
  return <BasvuruFormModal open={open} onOpenChange={onOpenChange} paketTipi={paketTipi} />
}
