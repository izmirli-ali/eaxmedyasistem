import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { BacklinkTracker } from "@/lib/backlink-tracker"

// Backlinkleri getir
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Kullanıcı oturumunu kontrol et
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor" }, { status: 401 })
    }

    // URL parametrelerini al
    const url = new URL(request.url)
    const businessId = url.searchParams.get("businessId")
    const status = url.searchParams.get("status") as any
    const limit = url.searchParams.get("limit") ? Number.parseInt(url.searchParams.get("limit")!) : 10
    const offset = url.searchParams.get("offset") ? Number.parseInt(url.searchParams.get("offset")!) : 0
    const orderBy = url.searchParams.get("orderBy") || "last_checked"
    const orderDirection = (url.searchParams.get("orderDirection") as "asc" | "desc") || "desc"
    const domain = url.searchParams.get("domain") || undefined
    const search = url.searchParams.get("search") || undefined

    if (!businessId) {
      return NextResponse.json({ error: "İşletme ID'si gereklidir" }, { status: 400 })
    }

    // Kullanıcının bu işletmeye erişim yetkisi olup olmadığını kontrol et
    const { data: isletme, error: isletmeError } = await supabase
      .from("isletmeler2")
      .select("user_id")
      .eq("id", businessId)
      .single()

    if (isletmeError || (isletme.user_id !== session.user.id && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Bu işletmeye erişim yetkiniz yok" }, { status: 403 })
    }

    // Backlink takip servisini başlat
    const backlinkTracker = BacklinkTracker.getInstance()

    // Backlinkleri getir
    const { backlinks, total } = await backlinkTracker.getBacklinks(businessId, {
      status,
      limit,
      offset,
      orderBy,
      orderDirection,
      domain,
      search,
    })

    return NextResponse.json({
      backlinks,
      total,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Backlinkler getirilirken hata:", error)
    return NextResponse.json({ error: "Backlinkler getirilirken bir hata oluştu" }, { status: 500 })
  }
}

// Backlink ekle
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Kullanıcı oturumunu kontrol et
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor" }, { status: 401 })
    }

    // İstek gövdesini al
    const body = await request.json()
    const { businessId, sourceUrl, targetUrl, anchorText, checkFrequency, notes } = body

    if (!businessId || !sourceUrl || !targetUrl) {
      return NextResponse.json({ error: "İşletme ID, kaynak URL ve hedef URL gereklidir" }, { status: 400 })
    }

    // Kullanıcının bu işletmeye erişim yetkisi olup olmadığını kontrol et
    const { data: isletme, error: isletmeError } = await supabase
      .from("isletmeler2")
      .select("user_id")
      .eq("id", businessId)
      .single()

    if (isletmeError || (isletme.user_id !== session.user.id && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Bu işletmeye erişim yetkiniz yok" }, { status: 403 })
    }

    // Backlink takip servisini başlat
    const backlinkTracker = BacklinkTracker.getInstance()

    // Backlink ekle
    const backlink = await backlinkTracker.addBacklink({
      business_id: businessId,
      source_url: sourceUrl,
      target_url: targetUrl,
      anchor_text: anchorText,
      check_frequency: checkFrequency || "weekly",
      notes,
      status: "pending",
    })

    if (!backlink) {
      return NextResponse.json({ error: "Backlink eklenirken bir hata oluştu" }, { status: 500 })
    }

    // Backlink durumunu kontrol et
    const updatedBacklink = await backlinkTracker.updateBacklinkStatus(backlink.id)

    return NextResponse.json({
      success: true,
      backlink: updatedBacklink || backlink,
    })
  } catch (error) {
    console.error("Backlink eklenirken hata:", error)
    return NextResponse.json({ error: "Backlink eklenirken bir hata oluştu" }, { status: 500 })
  }
}

// Backlink güncelle
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()

    // Kullanıcı oturumunu kontrol et
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor" }, { status: 401 })
    }

    // İstek gövdesini al
    const body = await request.json()
    const { backlinkId, updates } = body

    if (!backlinkId || !updates) {
      return NextResponse.json({ error: "Backlink ID ve güncellemeler gereklidir" }, { status: 400 })
    }

    // Backlink'in hangi işletmeye ait olduğunu kontrol et
    const { data: backlink, error: backlinkError } = await supabase
      .from("backlinks")
      .select("business_id")
      .eq("id", backlinkId)
      .single()

    if (backlinkError) {
      return NextResponse.json({ error: "Backlink bulunamadı" }, { status: 404 })
    }

    // Kullanıcının bu işletmeye erişim yetkisi olup olmadığını kontrol et
    const { data: isletme, error: isletmeError } = await supabase
      .from("isletmeler2")
      .select("user_id")
      .eq("id", backlink.business_id)
      .single()

    if (isletmeError || (isletme.user_id !== session.user.id && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Bu backlinki güncelleme yetkiniz yok" }, { status: 403 })
    }

    // Backlink takip servisini başlat
    const backlinkTracker = BacklinkTracker.getInstance()

    // Backlink güncelle
    const updatedBacklink = await backlinkTracker.updateBacklink(backlinkId, updates)

    if (!updatedBacklink) {
      return NextResponse.json({ error: "Backlink güncellenirken bir hata oluştu" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      backlink: updatedBacklink,
    })
  } catch (error) {
    console.error("Backlink güncellenirken hata:", error)
    return NextResponse.json({ error: "Backlink güncellenirken bir hata oluştu" }, { status: 500 })
  }
}

// Backlink sil
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()

    // Kullanıcı oturumunu kontrol et
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor" }, { status: 401 })
    }

    // URL parametrelerini al
    const url = new URL(request.url)
    const backlinkId = url.searchParams.get("id")

    if (!backlinkId) {
      return NextResponse.json({ error: "Backlink ID'si gereklidir" }, { status: 400 })
    }

    // Backlink'in hangi işletmeye ait olduğunu kontrol et
    const { data: backlink, error: backlinkError } = await supabase
      .from("backlinks")
      .select("business_id")
      .eq("id", backlinkId)
      .single()

    if (backlinkError) {
      return NextResponse.json({ error: "Backlink bulunamadı" }, { status: 404 })
    }

    // Kullanıcının bu işletmeye erişim yetkisi olup olmadığını kontrol et
    const { data: isletme, error: isletmeError } = await supabase
      .from("isletmeler2")
      .select("user_id")
      .eq("id", backlink.business_id)
      .single()

    if (isletmeError || (isletme.user_id !== session.user.id && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Bu backlinki silme yetkiniz yok" }, { status: 403 })
    }

    // Backlink takip servisini başlat
    const backlinkTracker = BacklinkTracker.getInstance()

    // Backlink sil
    const success = await backlinkTracker.deleteBacklink(backlinkId)

    if (!success) {
      return NextResponse.json({ error: "Backlink silinirken bir hata oluştu" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Backlink başarıyla silindi",
    })
  } catch (error) {
    console.error("Backlink silinirken hata:", error)
    return NextResponse.json({ error: "Backlink silinirken bir hata oluştu" }, { status: 500 })
  }
}
