import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface KategoriDagilimiProps {
  kategoriler: Record<string, number>
}

export function KategoriDagilimi({ kategoriler }: KategoriDagilimiProps) {
  // Kategorileri sayılarına göre sırala
  const siraliKategoriler = Object.entries(kategoriler)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8) // En fazla 8 kategori göster

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kategori Dağılımı</CardTitle>
        <CardDescription>İşletmelerin kategori bazında dağılımı</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {siraliKategoriler.map(([kategori, sayi]) => (
            <Card key={kategori} className="p-4">
              <div className="font-medium">{kategori}</div>
              <div className="text-2xl font-bold">{sayi}</div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
