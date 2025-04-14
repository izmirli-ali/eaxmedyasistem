// İşletme ID'si veya slug'ı için yönlendirme yardımcısı
export function getIsletmeRoute(idOrSlug: string) {
  return `/isletme/${idOrSlug}`
}

// Şehir bazlı route oluşturucu
export function getSehirRoute(sehir: string) {
  return `/sehir/${sehir}`
}

// Kategori bazlı route oluşturucu
export function getKategoriRoute(kategori: string) {
  return `/kategori/${kategori}`
}
