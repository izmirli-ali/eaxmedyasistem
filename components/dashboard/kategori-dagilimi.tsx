"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart, registerables } from "chart.js"

// Chart.js'nin tüm bileşenlerini kaydet
Chart.register(...registerables)

interface KategoriDagilimiProps {
  kategoriler: Record<string, number>
}

export function KategoriDagilimi({ kategoriler }: KategoriDagilimiProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<any>(null)

  // Kategorileri sayılarına göre sırala
  const siraliKategoriler = Object.entries(kategoriler || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8) // En fazla 8 kategori göster

  useEffect(() => {
    if (!chartRef.current || !kategoriler || Object.keys(kategoriler).length === 0) return

    // Önceki chart instance'ı temizle
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Rastgele renkler oluştur
    const generateColors = (count: number) => {
      const colors = []
      for (let i = 0; i < count; i++) {
        const hue = (i * 360) / count
        colors.push(`hsl(${hue}, 70%, 60%)`)
      }
      return colors
    }

    const labels = siraliKategoriler.map(([kategori]) => kategori)
    const data = siraliKategoriler.map(([, sayi]) => sayi)
    const colors = generateColors(labels.length)

    chartInstance.current = new Chart(ctx, {
      type: "pie",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors,
            borderColor: colors.map((color) => color.replace("60%", "50%")),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "right",
            labels: {
              boxWidth: 15,
              padding: 15,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || ""
                const value = context.raw as number
                const total = data.reduce((a, b) => a + b, 0)
                const percentage = Math.round((value / total) * 100)
                return `${label}: ${value} (${percentage}%)`
              },
            },
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [kategoriler, siraliKategoriler])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kategori Dağılımı</CardTitle>
        <CardDescription>İşletmelerin kategori bazında dağılımı</CardDescription>
      </CardHeader>
      <CardContent>
        {kategoriler && Object.keys(kategoriler).length > 0 ? (
          <div className="h-[300px] w-full">
            <canvas ref={chartRef} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">Veri bulunamadı</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
