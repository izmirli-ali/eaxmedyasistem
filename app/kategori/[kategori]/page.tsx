// Kategori bazlı işletme listesi sayfası
import { redirect } from "next/navigation"

export default function KategoriSayfasi({ params }: { params: { kategori: string } }) {
  // Kategori sayfasını işletme listesine yönlendir ve filtre uygula
  redirect(`/isletme-listesi?kategori=${params.kategori}`)
}
