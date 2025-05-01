"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, Mail, LinkIcon } from "lucide-react"

interface EnhancedBusinessDetailsProps {
  isletme: any
}

export function EnhancedBusinessDetails({ isletme }: EnhancedBusinessDetailsProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-4">İletişim Bilgileri</h3>
        <div className="space-y-3">
          {isletme.adres && (
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <span className="text-gray-700">{isletme.adres}</span>
            </div>
          )}
          {isletme.telefon && (
            <div className="flex items-start">
              <Phone className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <span className="text-gray-700">{isletme.telefon}</span>
            </div>
          )}
          {isletme.email && (
            <div className="flex items-start">
              <Mail className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <span className="text-gray-700">{isletme.email}</span>
            </div>
          )}
          {isletme.website && (
            <div className="flex items-start">
              <LinkIcon className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <a
                href={isletme.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {isletme.website}
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
