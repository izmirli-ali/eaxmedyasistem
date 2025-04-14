// Şehir bazlı işletme listesi sayfası
import { redirect } from "next/navigation"

export default function SehirSayfasi({ params }: { params: { sehir: string } }) {
  // Şehir sayfasını işletme listesine yönlendir ve filtre uygula
  redirect(`/isletme-listesi?sehir=${params.sehir}`)
}
