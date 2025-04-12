import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"

// Yedekleme listesini getir
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Yedeklemeleri getir
    const { data, error } = await supabase.from("backups").select("*").order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ backups: data || [] })
  } catch (error) {
    console.error("Yedekleme listesi alınırken hata:", error)
    return NextResponse.json({ error: "Yedekleme listesi alınırken bir hata oluştu" }, { status: 500 })
  }
}

// Yeni yedekleme başlat
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // İstek gövdesini al
    const body = await request.json()
    const { tables } = body

    if (!tables || !Array.isArray(tables) || tables.length === 0) {
      return NextResponse.json({ error: "Geçersiz istek. Yedeklenecek tablolar belirtilmedi." }, { status: 400 })
    }

    // Yeni bir yedekleme kaydı oluştur
    const backupId = uuidv4()
    const now = new Date().toISOString()

    const newBackup = {
      id: backupId,
      created_at: now,
      status: "pending",
      tables: tables,
    }

    // Yedekleme kaydını veritabanına ekle
    const { error: insertError } = await supabase.from("backups").insert([newBackup])

    if (insertError) throw insertError

    // Yedekleme işlemini başlat (asenkron)
    processBackup(backupId, tables, supabase).catch(console.error)

    return NextResponse.json({ success: true, backup: newBackup })
  } catch (error) {
    console.error("Yedekleme başlatılırken hata:", error)
    return NextResponse.json({ error: "Yedekleme başlatılırken bir hata oluştu" }, { status: 500 })
  }
}

// Yedekleme işlemini gerçekleştir
async function processBackup(backupId: string, tables: string[], supabase: any) {
  try {
    // Yedekleme durumunu güncelle
    await supabase.from("backups").update({ status: "in_progress" }).eq("id", backupId)

    // Her tablo için veri çek
    const backupData: Record<string, any[]> = {}

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select("*")

      if (error) throw error

      backupData[table] = data || []
    }

    // JSON dosyasına dönüştür
    const jsonData = JSON.stringify(backupData, null, 2)
    const fileName = `backup_${backupId}_${new Date().toISOString().replace(/:/g, "-")}.json`

    // Storage'a yükle
    const { error: uploadError } = await supabase.storage
      .from("backups")
      .upload(fileName, new Blob([jsonData], { type: "application/json" }))

    if (uploadError) throw uploadError

    // Yedekleme kaydını güncelle
    await supabase
      .from("backups")
      .update({
        status: "completed",
        file_name: fileName,
        file_size: jsonData.length,
        completed_at: new Date().toISOString(),
      })
      .eq("id", backupId)
  } catch (error) {
    console.error("Yedekleme işlemi sırasında hata:", error)

    // Hata durumunda yedekleme kaydını güncelle
    await supabase
      .from("backups")
      .update({
        status: "failed",
        error: error.message || "Bilinmeyen hata",
        completed_at: new Date().toISOString(),
      })
      .eq("id", backupId)
  }
}

// Yedekleme dosyasını indir
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()

    // İstek gövdesini al
    const body = await request.json()
    const { fileName } = body

    if (!fileName) {
      return NextResponse.json({ error: "Geçersiz istek. Dosya adı belirtilmedi." }, { status: 400 })
    }

    // İndirme URL'i oluştur
    const { data, error } = await supabase.storage.from("backups").createSignedUrl(fileName, 60) // 60 saniyelik geçerli URL

    if (error) throw error

    return NextResponse.json({ url: data.signedUrl })
  } catch (error) {
    console.error("Yedekleme indirme hatası:", error)
    return NextResponse.json({ error: "Yedekleme indirme sırasında bir hata oluştu" }, { status: 500 })
  }
}

// Yedekleme sil
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()

    // URL parametrelerini al
    const url = new URL(request.url)
    const backupId = url.searchParams.get("id")
    const fileName = url.searchParams.get("fileName")

    if (!backupId) {
      return NextResponse.json({ error: "Geçersiz istek. Yedekleme ID'si belirtilmedi." }, { status: 400 })
    }

    // Önce storage'dan dosyayı sil (eğer varsa)
    if (fileName) {
      const { error: storageError } = await supabase.storage.from("backups").remove([fileName])

      if (storageError) {
        console.warn("Dosya silinirken hata:", storageError)
        // Dosya silinmese bile devam et
      }
    }

    // Sonra veritabanından kaydı sil
    const { error: dbError } = await supabase.from("backups").delete().eq("id", backupId)

    if (dbError) throw dbError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Yedekleme silme hatası:", error)
    return NextResponse.json({ error: "Yedekleme silme sırasında bir hata oluştu" }, { status: 500 })
  }
}
