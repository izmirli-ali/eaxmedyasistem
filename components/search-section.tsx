"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin } from "lucide-react"

interface SearchSectionProps {
  categories: string[]
  cities: string[]
}

export function SearchSection({ categories, cities }: SearchSectionProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")

  // Arama işlemi - useCallback ile optimize edildi
  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      const params = new URLSearchParams()
      if (searchTerm) params.append("q", searchTerm)
      if (selectedCity && selectedCity !== "all") params.append("sehir", selectedCity)
      if (selectedCategory && selectedCategory !== "all") params.append("kategori", selectedCategory)

      router.push(`/isletme-listesi?${params.toString()}`)
    },
    [searchTerm, selectedCity, selectedCategory, router],
  )

  // Popüler arama butonları için handler
  const handlePopularSearch = useCallback((term: string, category: string) => {
    setSearchTerm(term)
    setSelectedCategory(category)
  }, [])

  return (
    <section className="py-12 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-gray-50 to-white">
          <CardContent className="p-8">
            <div className="flex items-center mb-6">
              <MapPin className="h-6 w-6 text-primary mr-2" aria-hidden="true" />
              <h2 className="text-2xl font-bold">İşletme Ara</h2>
            </div>

            <form onSubmit={handleSearch} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="search" className="text-sm font-medium">
                    İşletme Adı veya Anahtar Kelime
                  </label>
                  <Input
                    id="search"
                    placeholder="Örn: Cafe, Restaurant, Otel..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                    aria-label="İşletme adı veya anahtar kelime ara"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-medium">
                    Şehir
                  </label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger id="city" aria-label="Şehir seçin">
                      <SelectValue placeholder="Şehir seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Şehirler</SelectItem>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">
                    Kategori
                  </label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger id="category" aria-label="Kategori seçin">
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Kategoriler</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-center">
                <Button type="submit" className="px-8 bg-primary hover:bg-primary/90">
                  <Search className="mr-2 h-4 w-4" aria-hidden="true" />
                  İşletme Ara
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Popüler aramalar:
                <button
                  type="button"
                  onClick={() => handlePopularSearch("Cafe", "Yeme & İçme")}
                  className="text-primary hover:underline mx-1"
                >
                  Cafe
                </button>{" "}
                •
                <button
                  type="button"
                  onClick={() => handlePopularSearch("Restaurant", "Yeme & İçme")}
                  className="text-primary hover:underline mx-1"
                >
                  Restaurant
                </button>{" "}
                •
                <button
                  type="button"
                  onClick={() => handlePopularSearch("Otel", "Konaklama")}
                  className="text-primary hover:underline mx-1"
                >
                  Otel
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
