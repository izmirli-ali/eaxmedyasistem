"use client"

import { Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"

interface InstagramSimpleProps {
  username: string | null
  className?: string
}

export function InstagramSimple({ username, className }: InstagramSimpleProps) {
  if (!username) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <Instagram className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">Instagram hesabı bulunamadı</p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Instagram className="h-5 w-5 text-[#E4405F]" />
            <span className="font-medium">Instagram</span>
          </div>
          <a
            href={`https://instagram.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary-600 hover:underline"
          >
            @{username}
          </a>
        </div>

        <div className="p-4 text-center">
          <iframe
            src={`https://www.instagram.com/${username}/embed`}
            width="100%"
            height="450"
            frameBorder="0"
            scrolling="no"
            allowTransparency={true}
            title={`${username} Instagram gönderileri`}
            className="mx-auto"
          ></iframe>
        </div>
      </div>

      <div className="text-center">
        <Button variant="outline" asChild>
          <a
            href={`https://instagram.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2"
          >
            <Instagram className="h-4 w-4" />
            Tüm gönderileri görüntüle
          </a>
        </Button>
      </div>
    </div>
  )
}
