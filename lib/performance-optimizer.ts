/**
 * Performans Optimizasyonu Servisi
 * Bu servis, sayfa yükleme hızını artırmak için çeşitli optimizasyonlar sağlar
 */

import { createClient } from "@/lib/supabase/client"
import { v4 as uuidv4 } from "uuid"
import { CacheService } from "@/lib/cache-service"

export interface PerformanceMetric {
  id: string
  business_id: string
  page_url: string
  load_time: number // milisaniye cinsinden
  first_contentful_paint: number
  largest_contentful_paint: number
  time_to_interactive: number
  cumulative_layout_shift: number
  first_input_delay: number
  resource_count: number
  resource_size: number
  measured_at: string
  user_agent: string
  device_type: "desktop" | "mobile" | "tablet"
  connection_type?: string
}

export interface OptimizationSuggestion {
  id: string
  business_id: string
  page_url: string
  type: "image" | "script" | "style" | "font" | "html" | "server" | "other"
  severity: "high" | "medium" | "low"
  title: string
  description: string
  potential_saving: number // milisaniye cinsinden
  implementation_difficulty: "easy" | "medium" | "hard"
  is_implemented: boolean
  created_at: string
  updated_at: string
}

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer
  private supabase = createClient()
  private cacheService = CacheService.getInstance()

  private constructor() {}

  public static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer()
    }
    return PerformanceOptimizer.instance
  }

  /**
   * Performans metriğini kaydeder
   */
  public async savePerformanceMetric(metric: Omit<PerformanceMetric, "id">): Promise<PerformanceMetric | null> {
    try {
      const { data, error } = await this.supabase
        .from("performance_metrics")
        .insert({
          id: uuidv4(),
          ...metric,
        })
        .select()
        .single()
      
      if (error) throw error
      
      return data
    } catch (error) {
      console.error("Performans metriği kaydedilirken hata:", error)
      return null
    }
  }

  /**
   * Performans metriklerini getirir
   */
  public async getPerformanceMetrics(
    businessId: string,
    options: {
      pageUrl?: string
      startDate?: string
      endDate?: string
      deviceType?: "desktop" | "mobile" | "tablet" | "all"
      limit?: number
    } = {}
  ): Promise<PerformanceMetric[]> {
    try {
      const {
        pageUrl,
        startDate,
        endDate,
        deviceType = "all",
        limit = 100,
      } = options
      
      // Önbellekten getirmeyi dene
      const cacheKey = `performance_metrics_${businessId}_${pageUrl || "all"}_${startDate || "all"}_${endDate || "all"}_${deviceType}_${limit}`
      const cachedData = await this.cacheService.get<PerformanceMetric[]>(cacheKey)
      
      if (cachedData) {
        return cachedData
      }
      
      // Ana sorgu
      let query = this.supabase
        .from("performance_metrics")
        .select("*")
        .eq("business_id", businessId)
        .order("measured_at", { ascending: false })
        .limit(limit)
      
      // Filtreler
      if (pageUrl) {
        query = query.eq("page_url", pageUrl)
      }
      
      if (startDate) {
        query = query.gte("measured_at", startDate)
      }
      
      if (endDate) {
        query = query.lte("measured_at", endDate)
      }
      
      if (deviceType !== "all") {
        query = query.eq("device_type", deviceType)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      // Önbelleğe kaydet (5 dakika)
      await this.cacheService.set(cacheKey, data, 5 * 60)
      
      return data || []
    } catch (error) {
      console.error("Performans metrikleri getirilirken hata:", error)
      return []
    }
  }

  /**
   * Optimizasyon önerisi ekler
   */
  public async addOptimizationSuggestion(
    suggestion: Omit<OptimizationSuggestion, "id" | "created_at" | "updated_at">
  ): Promise<OptimizationSuggestion | null> {
    try {
      const now = new Date().toISOString()
      
      const { data, error } = await this.supabase
        .from("optimization_suggestions")
        .insert({
          id: uuidv4(),
          ...suggestion,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single()
      
      if (error) throw error
      
      return data
    } catch (error) {
      console.error("Optimizasyon önerisi eklenirken hata:", error)
      return null
    }
  }

  /**
   * Optimizasyon önerilerini getirir
   */
  public async getOptimizationSuggestions(
    businessId: string,
    options: {
      pageUrl?: string
      type?: string
      severity?: "high" | "medium" | "low" | "all"
      isImplemented?: boolean
      limit?: number
    } = {}
  ): Promise<OptimizationSuggestion[]> {
    try {
      const {
        pageUrl,
        type,
        severity = "all",
        isImplemented,
        limit = 100,
      } = options
      
      // Ana sorgu
      let query = this.supabase
        .from("optimization_suggestions")
        .select("*")
        .eq("business_id", businessId)
        .order("severity", { ascending: false })
        .order("potential_saving", { ascending: false })
        .limit(limit)
      
      // Filtreler
      if (pageUrl) {
        query = query.eq("page_url", pageUrl)
      }
      
      if (type) {
        query = query.eq("type", type)
      }
      
      if (severity !== "all") {
        query = query.eq("severity", severity)
      }
      
      if (isImplemented !== undefined) {
        query = query.eq("is_implemented", isImplemented)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      return data || []
    } catch (error) {
      console.error("Optimizasyon önerileri getirilirken hata:", error)
      return []
    }
  }

  /**
   * Optimizasyon önerisini günceller
   */
  public async updateOptimizationSuggestion(
    suggestion\
