interface CacheItem<T> {
  data: T
  timestamp: number
  expiresAt: number
}

type CacheScope = "memory" | "localStorage" | "sessionStorage"

export class EnhancedCacheService {
  private static instance: EnhancedCacheService
  private memoryCache: Map<string, CacheItem<any>> = new Map()
  private readonly DEFAULT_TTL = 60 * 60 * 1000 // 1 saat
  private readonly PREFIX = "app_cache_"
  private readonly MAX_CACHE_SIZE = 100 // Maksimum önbellek öğe sayısı
  private readonly MAX_CACHE_AGE = 24 * 60 * 60 * 1000 // 24 saat

  private constructor() {
    // Periyodik temizleme işlemi
    if (typeof window !== "undefined") {
      setInterval(() => this.cleanupCache(), this.MAX_CACHE_AGE)
    }
  }

  public static getInstance(): EnhancedCacheService {
    if (!EnhancedCacheService.instance) {
      EnhancedCacheService.instance = new EnhancedCacheService()
    }
    return EnhancedCacheService.instance
  }

  // Önbellekten veri alma
  public async get<T>(key: string, scope: CacheScope = "memory"): Promise<T | null> {
    const cacheKey = this.PREFIX + key

    try {
      let item: CacheItem<T> | null = null

      // Bellek önbelleğinden kontrol et
      if (scope === "memory") {
        item = (this.memoryCache.get(cacheKey) as CacheItem<T> | undefined) || null
      }
      // localStorage'dan kontrol et
      else if (scope === "localStorage" && typeof window !== "undefined") {
        const stored = localStorage.getItem(cacheKey)
        if (stored) {
          item = JSON.parse(stored) as CacheItem<T>
        }
      }
      // sessionStorage'dan kontrol et
      else if (scope === "sessionStorage" && typeof window !== "undefined") {
        const stored = sessionStorage.getItem(cacheKey)
        if (stored) {
          item = JSON.parse(stored) as CacheItem<T>
        }
      }

      // Önbellek öğesi yoksa veya süresi dolmuşsa null döndür
      if (!item || Date.now() > item.expiresAt) {
        if (scope === "memory") {
          this.memoryCache.delete(cacheKey)
        } else if (scope === "localStorage" && typeof window !== "undefined") {
          localStorage.removeItem(cacheKey)
        } else if (scope === "sessionStorage" && typeof window !== "undefined") {
          sessionStorage.removeItem(cacheKey)
        }
        return null
      }

      return item.data
    } catch (error) {
      console.error("Önbellek okuma hatası:", error)
      return null
    }
  }

  // Önbelleğe veri kaydetme
  public async set<T>(
    key: string,
    data: T,
    ttl: number = this.DEFAULT_TTL,
    scope: CacheScope = "memory",
  ): Promise<void> {
    const cacheKey = this.PREFIX + key

    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    }

    try {
      // Bellek önbelleğine kaydet
      if (scope === "memory") {
        this.memoryCache.set(cacheKey, item)

        // Önbellek boyutu kontrolü
        if (this.memoryCache.size > this.MAX_CACHE_SIZE) {
          this.pruneCache()
        }
      }
      // localStorage'a kaydet
      else if (scope === "localStorage" && typeof window !== "undefined") {
        localStorage.setItem(cacheKey, JSON.stringify(item))
      }
      // sessionStorage'a kaydet
      else if (scope === "sessionStorage" && typeof window !== "undefined") {
        sessionStorage.setItem(cacheKey, JSON.stringify(item))
      }
    } catch (error) {
      console.error("Önbellek yazma hatası:", error)
    }
  }

  // Önbellekten veri silme
  public async delete(key: string, scope: CacheScope = "memory"): Promise<void> {
    const cacheKey = this.PREFIX + key

    try {
      if (scope === "memory") {
        this.memoryCache.delete(cacheKey)
      } else if (scope === "localStorage" && typeof window !== "undefined") {
        localStorage.removeItem(cacheKey)
      } else if (scope === "sessionStorage" && typeof window !== "undefined") {
        sessionStorage.removeItem(cacheKey)
      }
    } catch (error) {
      console.error("Önbellek silme hatası:", error)
    }
  }

  // Tüm önbelleği temizleme
  public async clear(scope: CacheScope = "memory"): Promise<void> {
    try {
      if (scope === "memory") {
        this.memoryCache.clear()
      } else if (scope === "localStorage" && typeof window !== "undefined") {
        // Sadece uygulama önbelleğini temizle
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith(this.PREFIX)) {
            localStorage.removeItem(key)
          }
        })
      } else if (scope === "sessionStorage" && typeof window !== "undefined") {
        // Sadece uygulama önbelleğini temizle
        Object.keys(sessionStorage).forEach((key) => {
          if (key.startsWith(this.PREFIX)) {
            sessionStorage.removeItem(key)
          }
        })
      }
    } catch (error) {
      console.error("Önbellek temizleme hatası:", error)
    }
  }

  // Önbellekte yoksa getir ve kaydet
  public async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = this.DEFAULT_TTL,
    scope: CacheScope = "memory",
  ): Promise<T> {
    const cached = await this.get<T>(key, scope)
    if (cached !== null) return cached

    const data = await fetchFn()
    await this.set(key, data, ttl, scope)
    return data
  }

  // Supabase sorguları için önbellek yardımcısı
  public async cachedSupabaseQuery<T>(
    key: string,
    queryFn: () => Promise<{ data: T | null; error: any }>,
    ttl: number = this.DEFAULT_TTL,
    scope: CacheScope = "memory",
  ): Promise<T | null> {
    return this.getOrSet<T | null>(
      key,
      async () => {
        const { data, error } = await queryFn()
        if (error) {
          console.error("Supabase sorgu hatası:", error)
          throw error
        }
        return data
      },
      ttl,
      scope,
    )
  }

  // Eski önbellek öğelerini temizleme
  private cleanupCache(): void {
    const now = Date.now()

    // Bellek önbelleğini temizle
    for (const [key, item] of this.memoryCache.entries()) {
      if (now > item.expiresAt) {
        this.memoryCache.delete(key)
      }
    }

    // localStorage'ı temizle
    if (typeof window !== "undefined") {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(this.PREFIX)) {
          try {
            const item = JSON.parse(localStorage.getItem(key) || "{}") as CacheItem<any>
            if (now > item.expiresAt) {
              localStorage.removeItem(key)
            }
          } catch (e) {
            // Geçersiz JSON, öğeyi sil
            localStorage.removeItem(key)
          }
        }
      })

      // sessionStorage'ı temizle
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith(this.PREFIX)) {
          try {
            const item = JSON.parse(sessionStorage.getItem(key) || "{}") as CacheItem<any>
            if (now > item.expiresAt) {
              sessionStorage.removeItem(key)
            }
          } catch (e) {
            // Geçersiz JSON, öğeyi sil
            sessionStorage.removeItem(key)
          }
        }
      })
    }
  }

  // Önbellek boyutunu küçültme (LRU stratejisi)
  private pruneCache(): void {
    // Önbellek öğelerini son kullanım zamanına göre sırala
    const entries = Array.from(this.memoryCache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp)

    // En eski öğelerin %20'sini sil
    const deleteCount = Math.ceil(this.memoryCache.size * 0.2)
    for (let i = 0; i < deleteCount && i < entries.length; i++) {
      this.memoryCache.delete(entries[i][0])
    }
  }

  // Önbellek istatistiklerini alma
  public getCacheStats(): { size: number; oldestTimestamp: number | null; newestTimestamp: number | null } {
    let oldestTimestamp: number | null = null
    let newestTimestamp: number | null = null

    for (const item of this.memoryCache.values()) {
      if (oldestTimestamp === null || item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp
      }
      if (newestTimestamp === null || item.timestamp > newestTimestamp) {
        newestTimestamp = item.timestamp
      }
    }

    return {
      size: this.memoryCache.size,
      oldestTimestamp,
      newestTimestamp,
    }
  }
}

// Kullanım örneği
export const cacheService = EnhancedCacheService.getInstance()
