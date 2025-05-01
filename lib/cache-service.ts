interface CacheItem<T> {
  data: T
  timestamp: number
  expiresAt: number
}

export class CacheService {
  private static instance: CacheService
  private cache: Map<string, CacheItem<any>> = new Map()
  private readonly DEFAULT_TTL = 60 * 60 * 1000 // 1 saat

  private constructor() {}

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService()
    }
    return CacheService.instance
  }

  public async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  public async set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): Promise<void> {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    })
  }

  public async delete(key: string): Promise<void> {
    this.cache.delete(key)
  }

  public async clear(): Promise<void> {
    this.cache.clear()
  }

  public async getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttl: number = this.DEFAULT_TTL): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached) return cached

    const data = await fetchFn()
    await this.set(key, data, ttl)
    return data
  }
}
