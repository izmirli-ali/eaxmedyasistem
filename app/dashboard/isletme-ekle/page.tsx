"use client"

import { EnhancedFormExperience } from "@/components/forms/enhanced-form-experience"
import { useRouter } from "next/navigation"
import { handleIsletmeEkle } from "@/app/actions/isletme-actions"

export default function IsletmeEklePage() {
  const router = useRouter()

  const handleSubmit = async (data: any) => {
    const result = await handleIsletmeEkle(data)
    
    if (result.success) {
      router.push('/dashboard')
      router.refresh()
    } else {
      // Hata durumunda kullanıcıya bilgi ver
      console.error('İşletme eklenirken hata oluştu:', result.error)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Yeni İşletme Ekle</h1>

      <EnhancedFormExperience onSubmit={handleSubmit} submitButtonText="İşletmeyi Kaydet" />
    </div>
  )
}
