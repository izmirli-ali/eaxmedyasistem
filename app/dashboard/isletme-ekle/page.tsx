"use client"

import { EnhancedFormExperience } from "@/components/forms/enhanced-form-experience"
import { handleIsletmeEkle } from "./actions"

export default function IsletmeEklePage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Yeni İşletme Ekle</h1>
      <EnhancedFormExperience onSubmit={handleIsletmeEkle} submitButtonText="İşletmeyi Kaydet" />
    </div>
  )
}
