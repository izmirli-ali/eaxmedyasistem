"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BasvuruForm } from "@/components/basvuru-form"

interface BasvuruModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paketTipi?: string
}

export function BasvuruModal({ open, onOpenChange, paketTipi = "" }: BasvuruModalProps) {
  const handleSuccess = () => {
    // Başarılı başvurudan sonra modalı kapat
    setTimeout(() => {
      onOpenChange(false)
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {paketTipi === "tek-seferlik"
              ? "Tek Seferlik Paket Başvurusu"
              : paketTipi === "aylik"
                ? "Aylık Abonelik Başvurusu"
                : "Hizmet Başvuru Formu"}
          </DialogTitle>
        </DialogHeader>
        <BasvuruForm paketTipi={paketTipi} onSuccess={handleSuccess} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
