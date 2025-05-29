/**
 * Backlink Takip Sistemi
 * Bu modül, işletmenin backlink profilini izlemek için kullanılır
 */

import { createClient } from "@/lib/supabase/client"
import { v4 as uuidv4 } from "uuid"

export interface Backlink {
  id: string
  business_id: string
  source_url: string
  source_domain: string
  target_url: string
  anchor_text: string
  status: "active" | "broken" | "pending" | "nofollow"
  first_detected: string
  last_checked: string
  check_frequency: "daily" | "weekly" | "monthly"
  notes?: string
  da?: number // Domain Authority
  pa?: number // Page Authority
  trust_flow?: number
  citation_flow?: number
}

export interface BacklinkStats {
  totalBacklinks: number
  activeBacklinks: number
  brokenBacklinks: number
  pendingBacklinks: number
  nofollowBacklinks: number
  topDomains: { domain: string; count: number }[]
  domainAuthority: { min: number; max: number; avg: number }
}

export class BacklinkTracker {
  private static instance: BacklinkTracker
  private supabase = createClient()

  private constructor() {}

  public static getInstance(): BacklinkTracker {
    if (!BacklinkTracker.instance) {
      BacklinkTracker.instance = new BacklinkTracker()
    }
    return BacklinkTracker.instance
  }

  /**
   * Backlink ekler
   */
  public async addBacklink(
    backlink: Omit<Backlink, "id" | "first_detected" | "last_checked">,
  ): Promise<Backlink | null> {
    try {
      const now = new Date().toISOString()

      // Domain adını URL'den çıkar
      const domain = this.extractDomain(backlink.source_url)

      const newBacklink = {
        id: uuidv4(),
        ...backlink,
        source_domain: domain,
        first_detected: now,
        last_checked: now,
      }

      const { data, error } = await this.supabase.from("backlinks").insert(newBacklink).select().single()

      if (error) throw error

      return data
    } catch (error) {
      console.error("Backlink eklenirken hata:", error)
      return null
    }
  }

  /**
   * Backlink günceller
   */
  public async updateBacklink(backlinkId: string, updates: Partial<Backlink>): Promise<Backlink | null> {
    try {
      // Eğer source_url güncelleniyorsa, source_domain'i de güncelle
      if (updates.source_url) {
        updates.source_domain = this.extractDomain(updates.source_url)
      }

      const { data, error } = await this.supabase
        .from("backlinks")
        .update(updates)
        .eq("id", backlinkId)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error("Backlink güncellenirken hata:", error)
      return null
    }
  }

  /**
   * Backlink siler
   */
  public async deleteBacklink(backlinkId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.from("backlinks").delete().eq("id", backlinkId)

      if (error) throw error

      return true
    } catch (error) {
      console.error("Backlink silinirken hata:", error)
      return false
    }
  }

  /**
   * Backlinkleri getirir
   */
  public async getBacklinks(
    businessId: string,
    options: {
      status?: "active" | "broken" | "pending" | "nofollow" | "all"
      limit?: number
      offset?: number
      orderBy?: string
      orderDirection?: "asc" | "desc"
      domain?: string
      search?: string
    } = {},
  ): Promise<{ backlinks: Backlink[]; total: number }> {
    try {
      const {
        status = "all",
        limit = 10,
        offset = 0,
        orderBy = "last_checked",
        orderDirection = "desc",
        domain,
        search,
      } = options

      // Ana sorgu
      let query = this.supabase.from("backlinks").select("*", { count: "exact" }).eq("business_id", businessId)

      // Filtreler
      if (status !== "all") {
        query = query.eq("status", status)
      }

      if (domain) {
        query = query.eq("source_domain", domain)
      }

      if (search) {
        query = query.or(`source_url.ilike.%${search}%,anchor_text.ilike.%${search}%`)
      }

      // Sıralama ve sayfalama
      query = query.order(orderBy, { ascending: orderDirection === "asc" }).range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw error

      return {
        backlinks: data || [],
        total: count || 0,
      }
    } catch (error) {
      console.error("Backlinkler getirilirken hata:", error)
      return { backlinks: [], total: 0 }
    }
  }

  /**
   * Backlink istatistiklerini getirir
   */
  public async getBacklinkStats(businessId: string): Promise<BacklinkStats> {
    try {
      // Tüm backlinkleri getir
      const { data, error } = await this.supabase.from("backlinks").select("*").eq("business_id", businessId)

      if (error) throw error

      const backlinks = data || []

      // İstatistikleri hesapla
      const totalBacklinks = backlinks.length
      const activeBacklinks = backlinks.filter((b) => b.status === "active").length
      const brokenBacklinks = backlinks.filter((b) => b.status === "broken").length
      const pendingBacklinks = backlinks.filter((b) => b.status === "pending").length
      const nofollowBacklinks = backlinks.filter((b) => b.status === "nofollow").length

      // Domain bazında grupla
      const domainCounts: Record<string, number> = {}
      backlinks.forEach((b) => {
        domainCounts[b.source_domain] = (domainCounts[b.source_domain] || 0) + 1
      })

      // En çok backlink olan domainleri bul
      const topDomains = Object.entries(domainCounts)
        .map(([domain, count]) => ({ domain, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      // Domain Authority istatistikleri
      const daValues = backlinks.filter((b) => b.da !== undefined).map((b) => b.da!)
      const daMin = daValues.length > 0 ? Math.min(...daValues) : 0
      const daMax = daValues.length > 0 ? Math.max(...daValues) : 0
      const daAvg = daValues.length > 0 ? daValues.reduce((sum, val) => sum + val, 0) / daValues.length : 0

      return {
        totalBacklinks,
        activeBacklinks,
        brokenBacklinks,
        pendingBacklinks,
        nofollowBacklinks,
        topDomains,
        domainAuthority: {
          min: daMin,
          max: daMax,
          avg: daAvg,
        },
      }
    } catch (error) {
      console.error("Backlink istatistikleri getirilirken hata:", error)
      return {
        totalBacklinks: 0,
        activeBacklinks: 0,
        brokenBacklinks: 0,
        pendingBacklinks: 0,
        nofollowBacklinks: 0,
        topDomains: [],
        domainAuthority: { min: 0, max: 0, avg: 0 },
      }
    }
  }

  /**
   * Backlink durumunu kontrol eder
   */
  public async checkBacklinkStatus(backlinkId: string): Promise<"active" | "broken" | "nofollow"> {
    try {
      // Backlink bilgilerini getir
      const { data, error } = await this.supabase
        .from("backlinks")
        .select("source_url, target_url")
        .eq("id", backlinkId)
        .single()

      if (error) throw error

      // URL'yi kontrol et
      try {
        const response = await fetch(data.source_url, { method: "HEAD" })

        if (!response.ok) {
          return "broken"
        }

        // Sayfayı getir ve hedef URL'nin olup olmadığını kontrol et
        const pageResponse = await fetch(data.source_url)
        const html = await pageResponse.text()

        // Hedef URL'nin sayfada olup olmadığını kontrol et
        if (!html.includes(data.target_url)) {
          return "broken"
        }

        // Nofollow kontrolü
        if (
          html.includes(`href="${data.target_url}" rel="nofollow"`) ||
          html.includes(`href='${data.target_url}' rel='nofollow'`)
        ) {
          return "nofollow"
        }

        return "active"
      } catch (fetchError) {
        console.error("Backlink kontrolü sırasında hata:", fetchError)
        return "broken"
      }
    } catch (error) {
      console.error("Backlink durumu kontrol edilirken hata:", error)
      return "broken"
    }
  }

  /**
   * Backlink durumunu günceller
   */
  public async updateBacklinkStatus(backlinkId: string): Promise<Backlink | null> {
    try {
      // Durumu kontrol et
      const status = await this.checkBacklinkStatus(backlinkId)

      // Durumu güncelle
      const { data, error } = await this.supabase
        .from("backlinks")
        .update({
          status,
          last_checked: new Date().toISOString(),
        })
        .eq("id", backlinkId)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error("Backlink durumu güncellenirken hata:", error)
      return null
    }
  }

  /**
   * Kontrol zamanı gelen backlinkleri günceller
   */
  public async checkDueBacklinks(): Promise<number> {
    try {
      const now = new Date()
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)

      const lastWeek = new Date(now)
      lastWeek.setDate(lastWeek.getDate() - 7)

      const lastMonth = new Date(now)
      lastMonth.setMonth(lastMonth.getMonth() - 1)

      // Kontrol edilmesi gereken backlinkleri getir
      const { data, error } = await this.supabase
        .from("backlinks")
        .select("id, check_frequency, last_checked")
        .or(`check_frequency.eq.daily,check_frequency.eq.weekly,check_frequency.eq.monthly`)

      if (error) throw error

      const dueBacklinks = data.filter((backlink) => {
        const lastChecked = new Date(backlink.last_checked)

        if (backlink.check_frequency === "daily" && lastChecked < yesterday) {
          return true
        }

        if (backlink.check_frequency === "weekly" && lastChecked < lastWeek) {
          return true
        }

        if (backlink.check_frequency === "monthly" && lastChecked < lastMonth) {
          return true
        }

        return false
      })

      // Her bir backlinki güncelle
      let updatedCount = 0
      for (const backlink of dueBacklinks) {
        const updated = await this.updateBacklinkStatus(backlink.id)
        if (updated) {
          updatedCount++
        }
      }

      return updatedCount
    } catch (error) {
      console.error("Zamanı gelen backlinkler kontrol edilirken hata:", error)
      return 0
    }
  }

  /**
   * Domain adını URL'den çıkarır
   */
  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace(/^www\./, "")
    } catch (error) {
      // Geçersiz URL ise, URL'yi olduğu gibi döndür
      return url
    }
  }

  /**
   * Backlink önerileri oluşturur
   */
  public async generateBacklinkSuggestions(
    businessId: string,
  ): Promise<{ url: string; domain: string; relevance: number }[]> {
    try {
      // İşletme bilgilerini getir
      const { data: business, error: businessError } = await this.supabase
        .from("isletmeler2")
        .select("kategori, sehir")
        .eq("id", businessId)
        .single()

      if (businessError) throw businessError

      // Kategori ve şehre göre öneriler oluştur
      const suggestions = [
        {
          url: `https://www.yelp.com/search?find_desc=${business.kategori}&find_loc=${business.sehir}`,
          domain: "yelp.com",
          relevance: 95,
        },
        {
          url: `https://www.tripadvisor.com/Search?q=${business.kategori}%20${business.sehir}`,
          domain: "tripadvisor.com",
          relevance: 90,
        },
        {
          url: `https://foursquare.com/explore?mode=url&near=${business.sehir}&q=${business.kategori}`,
          domain: "foursquare.com",
          relevance: 85,
        },
        {
          url: `https://www.facebook.com/search/places/?q=${business.kategori}%20${business.sehir}`,
          domain: "facebook.com",
          relevance: 80,
        },
        {
          url: `https://www.instagram.com/explore/tags/${business.kategori}${business.sehir}/`,
          domain: "instagram.com",
          relevance: 75,
        },
        {
          url: `https://www.sahibinden.com/arama?query=${business.kategori}%20${business.sehir}`,
          domain: "sahibinden.com",
          relevance: 70,
        },
        {
          url: `https://www.sikayetvar.com/arama?q=${business.kategori}%20${business.sehir}`,
          domain: "sikayetvar.com",
          relevance: 65,
        },
        {
          url: `https://www.zomato.com/tr/${business.sehir.toLowerCase()}/restaurants`,
          domain: "zomato.com",
          relevance: 60,
        },
        {
          url: `https://www.yemeksepeti.com/${business.sehir.toLowerCase()}`,
          domain: "yemeksepeti.com",
          relevance: 55,
        },
        { url: `https://www.n11.com/arama?q=${business.kategori}`, domain: "n11.com", relevance: 50 },
      ]

      return suggestions
    } catch (error) {
      console.error("Backlink önerileri oluşturulurken hata:", error)
      return []
    }
  }
}
