"use client"

import { useState, useEffect } from "react"
import { Instagram } from "lucide-react"
import { InstagramEmbed } from "./instagram-embed"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface InstagramFeedProps {
  isletmeId: string
  className?: string
}

export function InstagramFeed({ isletmeId, className }: InstagramFeedProps) {
  const [instagramUsername, setInstagramUsername] = useState<string | null>(null)
  const [postUrls, setPostUrls] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isletmeId) {
      setIsLoading(true)
      setError(null)

      // İşletmenin sosyal medya bilgilerini al
      fetch(`/api/isletmeler/${isletmeId}/sosyal-medya`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Sosyal medya bilgileri alınamadı")
          }
          return response.json()
        })
        .then((data) => {
          // Instagram kullanıcı adını çıkar
          if (data.instagram) {
            const username = extractInstagramUsername(data.instagram)
            setInstagramUsername(username)

            if (username) {
              // Son 5 gönderiyi getir
              return fetch(`/api/instagram/embed-urls?username=${username}&limit=5`).then((response) => {
                if (!response.ok) {
                  throw new Error("Instagram gönderileri alınamadı")
                }
                return response.json()
              })
            }
          }
          return { urls: [] }
        })
        .then((data) => {
          setPostUrls(data.urls || [])
          setIsLoading(false)
        })
        .catch((err) => {
          console.error("Instagram bilgileri yüklenirken hata:", err)
          setError("Instagram gönderileri yüklenemedi")
          setIsLoading(false)
        })
    }
  }, [isletmeId])

  // Instagram URL'inden kullanıcı adını çıkar
  const extractInstagramUsername = (url: string): string | null => {
    try {
      // URL formatı: https://www.instagram.com/username/ veya https://instagram.com/username/
      const regex = /instagram\.com\/([^/?]+)/i
      const match = url.match(regex)
      return match ? match[1] : null
    } catch (error) {
      console.error("Instagram kullanıcı adı çıkarılamadı:", error)
      return null
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-500">Instagram gönderileri yükleniyor...</p>
      </div>
    )
  }

  if (error || !instagramUsername) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <Instagram className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">{error || "Instagram hesabı bulunamadı"}</p>
      </div>
    )
  }

  if (postUrls.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <Instagram className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">Bu işletme için Instagram gönderileri bulunamadı.</p>
        <a
          href={`https://instagram.com/${instagramUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 hover:underline mt-2 inline-block"
        >
          @{instagramUsername} Instagram hesabını ziyaret et
        </a>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {postUrls.map((url, index) => (
        <InstagramEmbed key={index} postUrl={url} caption={`@${instagramUsername} Instagram gönderisi`} />
      ))}
    </div>
  )
}
