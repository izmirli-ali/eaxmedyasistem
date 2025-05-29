/**
 * NAP (İsim, Adres, Telefon) Tutarlılığı Modülü
 * Bu modül, işletme bilgilerinin tüm platformlarda tutarlı olmasını sağlar
 */

import { createClient } from "@/lib/supabase/client"

export interface NAPData {
  name: string
  address: string
  phone: string
  website?: string
  email?: string
}

export interface NAPPlatform {
  id: string
  name: string
  url: string
  napData: NAPData
  lastChecked: Date | null
  isConsistent: boolean
}

export class NAPConsistencyService {
  private static instance: NAPConsistencyService
  private supabase = createClient()

  private constructor() {}

  public static getInstance(): NAPConsistencyService {
    if (!NAPConsistencyService.instance) {
      NAPConsistencyService.instance = new NAPConsistencyService()
    }
    return NAPConsistencyService.instance
  }

  /**
   * İşletme NAP verilerini alır
   */
  public async getBusinessNAP(businessId: string): Promise<NAPData | null> {
    try {
      const { data, error } = await this.supabase
        .from("isletmeler2")
        .select("isletme_adi, adres, telefon, website, email")
        .eq("id", businessId)
        .single()

      if (error) throw error

      return {
        name: data.isletme_adi,
        address: data.adres,
        phone: data.telefon,
        website: data.website,
        email: data.email,
      }
    } catch (error) {
      console.error("İşletme NAP verileri alınırken hata:", error)
      return null
    }
  }

  /**
   * İşletmenin takip edilen platformlarını alır
   */
  public async getTrackedPlatforms(businessId: string): Promise<NAPPlatform[]> {
    try {
      const { data, error } = await this.supabase
        .from("nap_platforms")
        .select("*")
        .eq("business_id", businessId)
        .order("name", { ascending: true })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error("Takip edilen platformlar alınırken hata:", error)
      return []
    }
  }

  /**
   * Yeni platform ekler
   */
  public async addPlatform(
    businessId: string,
    platform: Omit<NAPPlatform, "id" | "lastChecked" | "isConsistent">,
  ): Promise<NAPPlatform | null> {
    try {
      const { data, error } = await this.supabase
        .from("nap_platforms")
        .insert({
          business_id: businessId,
          name: platform.name,
          url: platform.url,
          nap_data: platform.napData,
          last_checked: null,
          is_consistent: false,
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        name: data.name,
        url: data.url,
        napData: data.nap_data,
        lastChecked: data.last_checked ? new Date(data.last_checked) : null,
        isConsistent: data.is_consistent,
      }
    } catch (error) {
      console.error("Platform eklenirken hata:", error)
      return null
    }
  }

  /**
   * Platform tutarlılığını günceller
   */
  public async updatePlatformConsistency(platformId: string, isConsistent: boolean): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("nap_platforms")
        .update({
          is_consistent: isConsistent,
          last_checked: new Date().toISOString(),
        })
        .eq("id", platformId)

      if (error) throw error
    } catch (error) {
      console.error("Platform tutarlılığı güncellenirken hata:", error)
      throw error
    }
  }

  /**
   * NAP tutarlılık raporu oluşturur
   */
  public async generateConsistencyReport(businessId: string): Promise<{
    consistentCount: number
    inconsistentCount: number
    notCheckedCount: number
    totalPlatforms: number
    consistencyScore: number
    platforms: NAPPlatform[]
  }> {
    try {
      const platforms = await this.getTrackedPlatforms(businessId)

      const consistentCount = platforms.filter((p) => p.isConsistent).length
      const inconsistentCount = platforms.filter((p) => p.lastChecked && !p.isConsistent).length
      const notCheckedCount = platforms.filter((p) => !p.lastChecked).length
      const totalPlatforms = platforms.length

      // Tutarlılık skoru: (tutarlı platform sayısı / toplam kontrol edilen platform sayısı) * 100
      const checkedPlatforms = totalPlatforms - notCheckedCount
      const consistencyScore = checkedPlatforms > 0 ? (consistentCount / checkedPlatforms) * 100 : 0

      return {
        consistentCount,
        inconsistentCount,
        notCheckedCount,
        totalPlatforms,
        consistencyScore,
        platforms,
      }
    } catch (error) {
      console.error("Tutarlılık raporu oluşturulurken hata:", error)
      throw error
    }
  }

  /**
   * NAP verilerini dışa aktarır (CSV formatında)
   */
  public exportNAPDataToCSV(napData: NAPData): string {
    const headers = ["Name", "Address", "Phone", "Website", "Email"]
    const values = [napData.name, napData.address, napData.phone, napData.website || "", napData.email || ""]

    return `${headers.join(",")}\n${values.join(",")}`
  }

  /**
   * NAP verilerini dışa aktarır (JSON formatında)
   */
  public exportNAPDataToJSON(napData: NAPData): string {
    return JSON.stringify(napData, null, 2)
  }

  /**
   * NAP verilerini dışa aktarır (HTML formatında)
   */
  public exportNAPDataToHTML(napData: NAPData): string {
    return `
      <div itemscope itemtype="http://schema.org/LocalBusiness">
        <h2 itemprop="name">${napData.name}</h2>
        <div itemprop="address" itemscope itemtype="http://schema.org/PostalAddress">
          <span itemprop="streetAddress">${napData.address}</span>
        </div>
        <div>Tel: <span itemprop="telephone">${napData.phone}</span></div>
        ${napData.website ? `<div>Web: <a href="${napData.website}" itemprop="url">${napData.website}</a></div>` : ""}
        ${napData.email ? `<div>E-posta: <a href="mailto:${napData.email}" itemprop="email">${napData.email}</a></div>` : ""}
      </div>
    `
  }
}
