"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BasvuruForm } from "@/components/basvuru-form"

interface BasvuruFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paketTipi?: string
}

export function BasvuruFormModal({ open, onOpenChange, paketTipi = "" }: BasvuruFormModalProps) {
  const handleSuccess = () => {
    // Başarılı başvurudan sonra modalı kapat
    setTimeout(() => {
      onOpenChange(false)
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {paketTipi === "yillik-klasik"
              ? "Yıllık Klasik Paket Başvurusu"
              : paketTipi === "yillik-premium"
                ? "Yıllık Premium Paket Başvurusu"
                : "Hizmet Başvuru Formu"}
          </DialogTitle>
        </DialogHeader>
        <BasvuruForm paketTipi={paketTipi} onSuccess={handleSuccess} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
