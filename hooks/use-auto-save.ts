"use client"

import { useState, useEffect, useRef } from "react"

interface UseAutoSaveOptions<T> {
  data: T
  onSave: (data: T) => Promise<void>
  interval?: number
  debounce?: number
  enabled?: boolean
}

export function useAutoSave<T>({
  data,
  onSave,
  interval = 30000, // 30 saniye
  debounce = 2000, // 2 saniye
  enabled = true,
}: UseAutoSaveOptions<T>) {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const dataRef = useRef(data)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Veri değiştiğinde referansı güncelle
  useEffect(() => {
    dataRef.current = data
  }, [data])

  // Kaydetme fonksiyonu
  const saveData = async () => {
    if (!enabled) return

    try {
      setIsSaving(true)
      setError(null)
      await onSave(dataRef.current)
      setLastSaved(new Date())
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Kaydetme hatası"))
      console.error("Otomatik kaydetme hatası:", err)
    } finally {
      setIsSaving(false)
    }
  }

  // Debounce ile kaydetme
  const debouncedSave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(saveData, debounce)
  }

  // Veri değiştiğinde debounce ile kaydet
  useEffect(() => {
    if (enabled) {
      debouncedSave()
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, enabled])

  // Düzenli aralıklarla kaydet
  useEffect(() => {
    if (enabled) {
      intervalRef.current = setInterval(saveData, interval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, interval])

  // Manuel kaydetme fonksiyonu
  const save = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    return saveData()
  }

  return {
    isSaving,
    lastSaved,
    error,
    save,
  }
}
