"use client"

// Form doğrulama hook'u
import { useState, useCallback } from "react"

type ValidationRule<T> = {
  validate: (value: any) => boolean
  message: string
}

type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[]
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules<T>,
) {
  const [formData, setFormData] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Tek bir alanı güncelle
  const updateFormData = useCallback((field: keyof T, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setTouched((prev) => ({ ...prev, [field]: true }))

    // Alanı doğrula
    validateField(field, value)
  }, [])

  // Tek bir alanı doğrula
  const validateField = useCallback(
    (field: keyof T, value: any) => {
      const fieldRules = validationRules[field]

      if (!fieldRules) return true

      for (const rule of fieldRules) {
        if (!rule.validate(value)) {
          setErrors((prev) => ({ ...prev, [field]: rule.message }))
          return false
        }
      }

      // Hata yoksa alanın hatasını temizle
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field as string]
        return newErrors
      })

      return true
    },
    [validationRules],
  )

  // Tüm formu doğrula
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    // Tüm alanları doğrula
    Object.keys(validationRules).forEach((field) => {
      const fieldRules = validationRules[field as keyof T]
      const value = formData[field as keyof T]

      if (fieldRules) {
        for (const rule of fieldRules) {
          if (!rule.validate(value)) {
            newErrors[field] = rule.message
            isValid = false
            break
          }
        }
      }
    })

    setErrors(newErrors)
    setTouched(
      Object.keys(validationRules).reduce(
        (acc, field) => {
          acc[field] = true
          return acc
        },
        {} as Record<string, boolean>,
      ),
    )

    return isValid
  }, [formData, validationRules])

  // Formu sıfırla
  const resetForm = useCallback(() => {
    setFormData(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  return {
    formData,
    errors,
    touched,
    updateFormData,
    validateField,
    validateForm,
    resetForm,
  }
}
