"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export function HomepagePreviewCard() {
  return (
    <Card className="mb-6 w-full md:w-1/2 lg:w-1/3">
      <CardHeader>
        <CardTitle className="text-sm">Ana Sayfa</CardTitle>
        <CardDescription className="text-xs">
          İşletmenizi Google Haritalar'da nasıl öne çıkaracağınızı ve daha fazla müşteriye nasıl ulaşacağınızı keşfedin!
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3">
        <Link href="/" className="block">
          Ana Sayfaya Git
        </Link>
      </CardContent>
    </Card>
  )
}
