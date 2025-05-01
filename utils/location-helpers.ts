// Adres doğrulama ve iyileştirme fonksiyonu
export async function validateAndImproveAddress(address: string): Promise<{
  isValid: boolean
  improvedAddress?: string
  components?: {
    city?: string
    district?: string
    country?: string
  }
}> {
  // Sunucu tarafında çalışıyorsa boş bir sonuç döndür
  if (typeof window === "undefined") {
    return { isValid: true }
  }

  try {
    // Nominatim API ile adres doğrulama
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
    )

    const data = await response.json()

    if (!data || data.length === 0) {
      return { isValid: false }
    }

    // Adres bileşenlerini çıkar
    const components: {
      city?: string
      district?: string
      country?: string
    } = {}

    if (data[0].address) {
      components.city = data[0].address.state || data[0].address.city
      components.district = data[0].address.county || data[0].address.suburb
      components.country = data[0].address.country
    }

    return {
      isValid: true,
      improvedAddress: data[0].display_name,
      components,
    }
  } catch (error) {
    console.error("Adres doğrulama hatası:", error)
    // Hata durumunda geçerli kabul et
    return { isValid: true }
  }
}
