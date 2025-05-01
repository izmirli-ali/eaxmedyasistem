// Veritabanı şemasına uygun veri doğrulama yardımcı fonksiyonları
import { createClient } from "@/lib/supabase/client"

/**
 * Veritabanı şemasını kontrol eder ve form verilerini doğrular
 * @param tableName Tablo adı
 * @param formData Form verileri
 * @returns Doğrulama sonucu ve hata mesajları
 */
export async function validateFormAgainstSchema(tableName: string, formData: Record<string, any>) {
  const supabase = createClient()
  const errors: Record<string, string> = {}
  let isValid = true

  try {
    // Tablo şemasını al
    const { data: columns, error } = await supabase.rpc("get_table_columns", { table_name: tableName })

    if (error) throw error

    if (!columns || columns.length === 0) {
      return { isValid: false, errors: { general: `${tableName} tablosu bulunamadı` } }
    }

    // Her bir sütun için doğrulama yap
    for (const column of columns) {
      const { column_name, data_type, is_nullable, character_maximum_length } = column

      // Zorunlu alan kontrolü
      if (is_nullable === "NO" && column_name !== "id" && !formData[column_name] && formData[column_name] !== 0) {
        errors[column_name] = `${column_name} alanı zorunludur`
        isValid = false
        continue
      }

      // Veri tipi kontrolü
      if (formData[column_name] !== undefined && formData[column_name] !== null) {
        // Metin uzunluğu kontrolü
        if (data_type.includes("character") && character_maximum_length) {
          if (String(formData[column_name]).length > character_maximum_length) {
            errors[column_name] = `${column_name} alanı en fazla ${character_maximum_length} karakter olabilir`
            isValid = false
          }
        }

        // Sayısal alan kontrolü
        if ((data_type === "integer" || data_type === "numeric") && isNaN(Number(formData[column_name]))) {
          errors[column_name] = `${column_name} alanı sayısal olmalıdır`
          isValid = false
        }

        // Tarih kontrolü
        if (data_type.includes("timestamp") || data_type.includes("date")) {
          try {
            new Date(formData[column_name])
          } catch (e) {
            errors[column_name] = `${column_name} alanı geçerli bir tarih olmalıdır`
            isValid = false
          }
        }
      }
    }

    return { isValid, errors }
  } catch (error) {
    console.error("Şema doğrulama hatası:", error)
    return {
      isValid: false,
      errors: { general: "Form verileri doğrulanırken bir hata oluştu" },
    }
  }
}

/**
 * Form verilerini veritabanı şemasına uygun formata dönüştürür
 * @param tableName Tablo adı
 * @param formData Form verileri
 * @returns Dönüştürülmüş veriler
 */
export async function transformFormDataForSchema(tableName: string, formData: Record<string, any>) {
  const supabase = createClient()
  const transformedData: Record<string, any> = {}

  try {
    // Tablo şemasını al
    const { data: columns, error } = await supabase.rpc("get_table_columns", { table_name: tableName })

    if (error) throw error

    if (!columns || columns.length === 0) {
      return formData // Şema alınamazsa orijinal veriyi döndür
    }

    // Her bir sütun için veri dönüşümü yap
    for (const column of columns) {
      const { column_name, data_type } = column

      if (formData[column_name] === undefined || formData[column_name] === null) {
        continue // Değer yoksa atla
      }

      // Veri tipi dönüşümleri
      switch (data_type) {
        case "integer":
        case "bigint":
          transformedData[column_name] = Number.parseInt(formData[column_name], 10)
          break
        case "numeric":
        case "double precision":
          transformedData[column_name] = Number.parseFloat(formData[column_name])
          break
        case "boolean":
          transformedData[column_name] = Boolean(formData[column_name])
          break
        case "json":
        case "jsonb":
          if (typeof formData[column_name] === "string") {
            try {
              transformedData[column_name] = JSON.parse(formData[column_name])
            } catch (e) {
              transformedData[column_name] = formData[column_name]
            }
          } else {
            transformedData[column_name] = formData[column_name]
          }
          break
        case "ARRAY":
          if (typeof formData[column_name] === "string") {
            transformedData[column_name] = formData[column_name].split(",").map((item) => item.trim())
          } else {
            transformedData[column_name] = formData[column_name]
          }
          break
        default:
          transformedData[column_name] = formData[column_name]
      }
    }

    return { ...formData, ...transformedData }
  } catch (error) {
    console.error("Veri dönüştürme hatası:", error)
    return formData // Hata durumunda orijinal veriyi döndür
  }
}
