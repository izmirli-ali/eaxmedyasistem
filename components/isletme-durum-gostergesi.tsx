"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface IsletmeDurumGostergesiProps {
  calismaSaatleri: string | Record<string, any>
  className?: string
}

export function IsletmeDurumGostergesi({ calismaSaatleri, className }: IsletmeDurumGostergesiProps) {
  const [durum, setDurum] = useState({ acik: false, mesaj: "Yükleniyor..." })

  useEffect(() => {
    try {
      // Şu anki gün ve saat kontrolü
      const simdi = new Date()
      const gun = ["pazar", "pazartesi", "sali", "carsamba", "persembe", "cuma", "cumartesi"][simdi.getDay()]
      const saat = simdi.getHours() + simdi.getMinutes() / 60

      const gunVerisi = typeof calismaSaatleri === "string" ? JSON.parse(calismaSaatleri)[gun] : calismaSaatleri[gun]

      if (!gunVerisi || gunVerisi.kapali) {
        setDurum({ acik: false, mesaj: "Bugün Kapalı" })
      } else {
        const acilis =
          Number.parseInt(gunVerisi.acilis.split(":")[0]) + Number.parseInt(gunVerisi.acilis.split(":")[1]) / 60
        const kapanis =
          Number.parseInt(gunVerisi.kapanis.split(":")[0]) + Number.parseInt(gunVerisi.kapanis.split(":")[1]) / 60

        if (saat >= acilis && saat < kapanis) {
          setDurum({
            acik: true,
            mesaj: `Açık · ${gunVerisi.kapanis}'da kapanıyor`,
          })
        } else {
          setDurum({
            acik: false,
            mesaj: `Kapalı · ${gunVerisi.acilis}'da açılıyor`,
          })
        }
      }
    } catch (e) {
      setDurum({ acik: false, mesaj: "Çalışma saati bilgisi yok" })
    }
  }, [calismaSaatleri])

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn("w-2.5 h-2.5 rounded-full", durum.acik ? "bg-green-500 animate-pulse-slow" : "bg-red-500")}
        aria-hidden="true"
      ></span>
      <span className="text-sm font-medium flex items-center gap-1">
        <Clock className="h-3.5 w-3.5 text-gray-500" />
        {durum.mesaj}
      </span>
    </div>
  )
}
