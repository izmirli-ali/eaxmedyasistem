"use client"

import type React from "react"

import { useState, useRef, type DragEvent, type ChangeEvent } from "react"
import { Upload, Loader2, ImageIcon, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DragDropFileUploadProps {
  onFilesSelected: (files: File[]) => void
  maxFiles?: number
  maxFileSize?: number // MB cinsinden maksimum dosya boyutu
  accept?: string
  className?: string
  uploading?: boolean
}

export function DragDropFileUpload({
  onFilesSelected,
  maxFiles = 10,
  maxFileSize = 5, // Varsayılan 5MB
  accept = "image/*",
  className,
  uploading = false,
}: DragDropFileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const validateFiles = (files: File[]): { valid: boolean; message?: string } => {
    if (files.length > maxFiles) {
      return { valid: false, message: `En fazla ${maxFiles} dosya yükleyebilirsiniz.` }
    }

    // Dosya boyutu kontrolü
    const maxSizeBytes = maxFileSize * 1024 * 1024 // MB'dan byte'a çevirme
    const oversizedFile = files.find((file) => file.size > maxSizeBytes)
    if (oversizedFile) {
      return {
        valid: false,
        message: `"${oversizedFile.name}" dosyası çok büyük. Maksimum dosya boyutu ${maxFileSize}MB olmalıdır.`,
      }
    }

    // Dosya türü kontrolü
    const invalidFile = files.find((file) => !file.type.startsWith("image/"))
    if (invalidFile) {
      return {
        valid: false,
        message: `"${invalidFile.name}" desteklenmeyen bir dosya türüdür. Lütfen sadece resim dosyaları yükleyin.`,
      }
    }

    return { valid: true }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    setError(null)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      const imageFiles = files.filter((file) => file.type.startsWith("image/"))

      const validation = validateFiles(imageFiles)
      if (!validation.valid) {
        setError(validation.message || "Dosya yükleme hatası")
        return
      }

      onFilesSelected(imageFiles)
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null)
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)

      const validation = validateFiles(files)
      if (!validation.valid) {
        setError(validation.message || "Dosya yükleme hatası")
        return
      }

      onFilesSelected(files)
      // Input değerini sıfırla ki aynı dosyayı tekrar seçebilsin
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // handleKeyDown fonksiyonu ekle
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      fileInputRef.current?.click()
    }
  }

  return (
    <div className="space-y-4">
      {/* Div elementine onKeyDown ekle */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          className,
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Dosya yükleme alanı"
      >
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          {uploading ? (
            <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" aria-hidden="true" />
          ) : (
            <div className="rounded-full bg-primary/10 p-3" aria-hidden="true">
              <ImageIcon className="h-6 w-6 text-primary" />
            </div>
          )}

          <div className="space-y-2">
            <h3 className="font-medium text-lg">{uploading ? "Yükleniyor..." : "Fotoğrafları buraya sürükleyin"}</h3>
            <p className="text-sm text-muted-foreground">
              {uploading
                ? "Fotoğraflarınız yükleniyor, lütfen bekleyin..."
                : `SVG, PNG, JPG veya GIF (maks. ${maxFiles} dosya, her biri maks. ${maxFileSize}MB)`}
            </p>
          </div>

          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              multiple
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
              aria-label="Dosya seç"
              id="file-upload"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              aria-controls="file-upload"
            >
              <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>Dosya Seç</span>
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
