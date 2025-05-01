import { createClient } from "@/lib/supabase/client"

interface GoogleMapsPlace {
  place_id: string
  name: string
  rating?: number
  reviews?: Array<{
    author_name: string
    rating: number
    text: string
    time: number
  }>
}

export class GoogleMapsService {
  private static instance: GoogleMapsService
  private supabase = createClient()
  private apiKey: string
  private rateLimiter: Map<string, number> = new Map()
  private readonly RATE_LIMIT = 50 // Dakikada maksimum istek sayısı
  private readonly RATE_LIMIT_WINDOW = 60000 // 1 dakika

  private constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  public static getInstance(apiKey: string): GoogleMapsService {
    if (!GoogleMapsService.instance) {
      GoogleMapsService.instance = new GoogleMapsService(apiKey)
    }
    return GoogleMapsService.instance
  }

  private async checkRateLimit(key: string): Promise<boolean> {
    const now = Date.now()
    const requests = this.rateLimiter.get(key) || 0

    if (requests >= this.RATE_LIMIT) {
      return false
    }

    this.rateLimiter.set(key, requests + 1)
    setTimeout(() => {
      const currentRequests = this.rateLimiter.get(key) || 0
      this.rateLimiter.set(key, Math.max(0, currentRequests - 1))
    }, this.RATE_LIMIT_WINDOW)

    return true
  }

  private async loadGoogleMapsAPI(): Promise<void> {
    if (typeof window === "undefined" || !window.google || !window.google.maps || !window.google.maps.places) {
      return new Promise((resolve, reject) => {
        window.initGoogleMapsCallback = () => {
          if (window.google && window.google.maps && window.google.maps.places) {
            resolve()
          } else {
            reject(new Error("Google Maps API yüklenemedi."))
          }
          delete window.initGoogleMapsCallback
        }

        const script = document.createElement("script")
        script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places&callback=initGoogleMapsCallback`
        script.async = true
        script.defer = true
        script.onerror = () => {
          reject(new Error("Google Maps API yüklenirken hata oluştu."))
          delete window.initGoogleMapsCallback
        }
        document.head.appendChild(script)
      })
    }
  }

  public async getPlaceId(isletmeId: number, businessName: string, coordinates: string): Promise<string> {
    // Rate limit kontrolü
    if (!(await this.checkRateLimit("place_id"))) {
      throw new Error("Rate limit aşıldı. Lütfen daha sonra tekrar deneyin.")
    }

    // Veritabanından Place ID'yi kontrol et
    const { data: existingPlace, error: dbError } = await this.supabase
      .from("google_maps_place_ids")
      .select("*")
      .eq("isletme_id", isletmeId)
      .single()

    if (dbError && dbError.code !== "PGRST116") {
      throw new Error(`Veritabanı hatası: ${dbError.message}`)
    }

    // Place ID varsa ve güncel ise döndür
    if (existingPlace && existingPlace.status === "active" && new Date(existingPlace.next_update) > new Date()) {
      return existingPlace.place_id
    }

    // Google Maps API'yi yükle
    await this.loadGoogleMapsAPI()

    const [latitude, longitude] = coordinates.split(",").map(Number)
    const placesService = new window.google.maps.places.PlacesService(document.createElement("div"))

    try {
      const result = await new Promise<GoogleMapsPlace>((resolve, reject) => {
        placesService.findPlaceFromQuery(
          {
            query: businessName,
            locationBias: { lat: latitude, lng: longitude },
            fields: ["place_id"],
          },
          (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
              resolve(results[0])
            } else {
              reject(new Error(`İşletme bulunamadı. Durum: ${status}`))
            }
          },
        )
      })

      // Place ID'yi veritabanına kaydet
      const { error: upsertError } = await this.supabase.from("google_maps_place_ids").upsert({
        isletme_id: isletmeId,
        place_id: result.place_id,
        last_updated: new Date().toISOString(),
        next_update: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
        error_count: 0,
      })

      if (upsertError) {
        throw new Error(`Place ID kaydedilirken hata oluştu: ${upsertError.message}`)
      }

      return result.place_id
    } catch (error) {
      // Hata durumunda veritabanını güncelle
      if (existingPlace) {
        await this.supabase.from("google_maps_place_ids").update({
          status: "error",
          error_count: (existingPlace.error_count || 0) + 1,
          last_error: error.message,
          next_update: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 dakika sonra tekrar dene
        })
      }
      throw error
    }
  }

  public async getReviews(placeId: string): Promise<GoogleMapsPlace["reviews"]> {
    // Rate limit kontrolü
    if (!(await this.checkRateLimit("reviews"))) {
      throw new Error("Rate limit aşıldı. Lütfen daha sonra tekrar deneyin.")
    }

    await this.loadGoogleMapsAPI()

    const placesService = new window.google.maps.places.PlacesService(document.createElement("div"))

    return new Promise((resolve, reject) => {
      placesService.getDetails(
        {
          placeId: placeId,
          fields: ["reviews"],
        },
        (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            resolve(place.reviews || [])
          } else {
            reject(new Error(`Yorumlar yüklenemedi. Durum: ${status}`))
          }
        },
      )
    })
  }
}
