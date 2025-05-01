"use client"

import { useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Save, CheckCircle2 } from "lucide-react"

interface MultiStepFormProps {
  steps: {
    title: string
    content: ReactNode
    optional?: boolean
  }[]
  onComplete: (data: any) => void
  formData: any
  onSaveDraft?: () => void
}

export function MultiStepForm({ steps, onComplete, formData, onSaveDraft }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps((prev) => {
        if (!prev.includes(currentStep)) {
          return [...prev, currentStep]
        }
        return prev
      })
      setCurrentStep((prev) => prev + 1)
      window.scrollTo(0, 0)
    } else {
      onComplete(formData)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
      window.scrollTo(0, 0)
    }
  }

  const handleSaveDraft = async () => {
    if (onSaveDraft) {
      setIsSaving(true)
      await onSaveDraft()
      setTimeout(() => setIsSaving(false), 1000)
    }
  }

  const isStepOptional = steps[currentStep]?.optional || false
  const isLastStep = currentStep === steps.length - 1
  const isStepCompleted = completedSteps.includes(currentStep)

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Adım {currentStep + 1}/{steps.length}: {steps[currentStep].title}
          </h2>
          <span className="text-sm text-muted-foreground">
            {completedSteps.length} / {steps.length} tamamlandı
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="space-y-6">
        <div className="min-h-[300px]">{steps[currentStep].content}</div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Geri
            </Button>

            {onSaveDraft && (
              <Button type="button" variant="secondary" onClick={handleSaveDraft} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Kaydedildi
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Taslak Kaydet
                  </>
                )}
              </Button>
            )}
          </div>

          <Button type="button" onClick={handleNext}>
            {isLastStep ? "Tamamla" : "İleri"}
            {!isLastStep && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex justify-center">
        <ul className="flex gap-2">
          {steps.map((step, index) => (
            <li key={index}>
              <Button
                type="button"
                variant={currentStep === index ? "default" : completedSteps.includes(index) ? "outline" : "ghost"}
                size="sm"
                className={`rounded-full w-10 h-10 p-0 ${step.optional ? "opacity-70" : ""}`}
                onClick={() => setCurrentStep(index)}
              >
                {index + 1}
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
