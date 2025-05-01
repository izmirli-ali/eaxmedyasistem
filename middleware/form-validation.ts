// Form verilerini doğrulayan middleware
import { NextResponse } from "next/server"
import { validateFormAgainstSchema, transformFormDataForSchema } from "@/lib/form-validation"

/**
 * Form verilerini doğrulayan middleware
 * @param req İstek nesnesi
 * @param tableName Tablo adı
 * @returns Doğrulama sonucu
 */
export async function validateFormMiddleware(req, tableName) {
  try {
    // Form verilerini al
    const formData = await req.json()

    // Verileri doğrula
    const { isValid, errors } = await validateFormAgainstSchema(tableName, formData)

    if (!isValid) {
      return NextResponse.json({ success: false, errors }, { status: 400 })
    }

    // Verileri dönüştür
    const transformedData = await transformFormDataForSchema(tableName, formData)

    // İsteği güncelle
    req.transformedData = transformedData

    return { success: true, data: transformedData }
  } catch (error) {
    console.error("Form doğrulama middleware hatası:", error)
    return NextResponse.json({ success: false, error: "Form verileri işlenirken bir hata oluştu" }, { status: 500 })
  }
}
