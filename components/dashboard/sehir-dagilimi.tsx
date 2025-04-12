import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SehirDagilimiProps {
  sehirler: Record<string, number>
}

export function SehirDagilimi({ sehirler }: SehirDagilimiProps) {
  // Şehirleri sayılarına göre sırala
  const siraliSehirler = Object.entries(sehirler)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8) // En fazla 8 şehir göster

  return (
    <Card>
      <CardHeader>
        <CardTitle>Şehir Dağılımı</CardTitle>
        <CardDescription>İşletmelerin şehir bazında dağılımı</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {siraliSehirler.map(([sehir, sayi]) => (
            <Card key={sehir} className="p-4">
              <div className="font-medium">{sehir}</div>
              <div className="text-2xl font-bold">{sayi}</div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
