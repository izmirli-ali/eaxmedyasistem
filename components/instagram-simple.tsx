"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Instagram } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface InstagramSimpleProps {
  username: string | null
}

export function InstagramSimple({ username }: InstagramSimpleProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Yükleme durumunu simüle et
    const timer = setTimeout(() => {
      setLoading(false)
      if (!username) {
        setError("Instagram kullanıcı adı bulunamadı.")
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [username])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-md" />
              ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !username) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="py-8">
            <Instagram className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">{error || "Bu işletme için Instagram bilgisi bulunamadı."}</p>
            {username && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => window.open(`https://instagram.com/${username}`, "_blank")}
              >
                Instagram'da Görüntüle
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 flex items-center justify-center">
            <Instagram className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-medium">{username}</h3>
            <p className="text-sm text-gray-500">Instagram</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => window.open(`https://instagram.com/${username}`, "_blank")}
          >
            Takip Et
          </Button>
        </div>

        {/* Instagram gönderileri yerine placeholder */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-gray-100 rounded-md overflow-hidden hover:opacity-90 transition-opacity cursor-pointer"
                onClick={() => window.open(`https://instagram.com/${username}`, "_blank")}
              >
                <img
                  src={`/placeholder.svg?key=vukcz&height=300&width=300&query=instagram post ${i + 1}`}
                  alt={`Instagram post ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
        </div>

        <div className="mt-4 text-center">
          <Button
            variant="link"
            className="text-sm"
            onClick={() => window.open(`https://instagram.com/${username}`, "_blank")}
          >
            Tüm gönderileri görüntüle
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
