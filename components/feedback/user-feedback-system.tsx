"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ThumbsUp, ThumbsDown, MessageSquare, X, Send, Star } from "lucide-react"

type FeedbackType = "bug" | "feature" | "question" | "praise" | "other"
type FeedbackRating = 1 | 2 | 3 | 4 | 5

interface FeedbackData {
  type: FeedbackType
  message: string
  rating?: FeedbackRating
  page_url: string
  user_id?: string
  user_email?: string
  browser_info: string
  screen_size: string
}

export function UserFeedbackSystem() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("other")
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [feedbackRating, setFeedbackRating] = useState<FeedbackRating | undefined>(undefined)
  const [userInfo, setUserInfo] = useState<{ id?: string; email?: string }>({})
  const { toast } = useToast()

  // Kullanıcı bilgilerini al
  useEffect(() => {
    const fetchUserInfo = async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        setUserInfo({
          id: session.user.id,
          email: session.user.email,
        })
      }
    }

    fetchUserInfo()
  }, [])

  // Geri bildirim gönder
  const submitFeedback = async () => {
    if (!feedbackMessage.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen bir geri bildirim mesajı girin.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()

      const feedbackData: FeedbackData = {
        type: feedbackType,
        message: feedbackMessage,
        rating: feedbackRating,
        page_url: window.location.href,
        user_id: userInfo.id,
        user_email: userInfo.email,
        browser_info: navigator.userAgent,
        screen_size: `${window.innerWidth}x${window.innerHeight}`,
      }

      // Geri bildirimi veritabanına kaydet
      const { error } = await supabase.from("user_feedback").insert([feedbackData])

      if (error) throw error

      toast({
        title: "Teşekkürler!",
        description: "Geri bildiriminiz başarıyla gönderildi.",
      })

      // Formu sıfırla
      setFeedbackType("other")
      setFeedbackMessage("")
      setFeedbackRating(undefined)
      setIsOpen(false)
      setIsExpanded(false)
    } catch (error) {
      console.error("Geri bildirim gönderme hatası:", error)
      toast({
        title: "Hata",
        description: "Geri bildiriminiz gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Hızlı geri bildirim gönder
  const sendQuickFeedback = async (isPositive: boolean) => {
    try {
      const supabase = createClient()

      const feedbackData: FeedbackData = {
        type: isPositive ? "praise" : "other",
        message: isPositive ? "Sayfa beğenildi" : "Sayfa beğenilmedi",
        page_url: window.location.href,
        user_id: userInfo.id,
        user_email: userInfo.email,
        browser_info: navigator.userAgent,
        screen_size: `${window.innerWidth}x${window.innerHeight}`,
      }

      await supabase.from("user_feedback").insert([feedbackData])

      toast({
        title: "Teşekkürler!",
        description: isPositive
          ? "Olumlu geri bildiriminiz için teşekkür ederiz."
          : "Geri bildiriminiz için teşekkür ederiz. Deneyiminizi iyileştirmek için çalışacağız.",
        duration: 3000,
      })

      setIsExpanded(false)
    } catch (error) {
      console.error("Hızlı geri bildirim hatası:", error)
    }
  }

  return (
    <>
      {/* Sabit Geri Bildirim Butonu */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-2">
        {isExpanded && (
          <div className="flex flex-col items-end space-y-2 mb-2">
            <div className="bg-white rounded-lg shadow-lg p-2 flex items-center space-x-2 animate-in slide-in-from-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => sendQuickFeedback(true)}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <ThumbsUp className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => sendQuickFeedback(false)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <ThumbsDown className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        <Button
          variant={isExpanded ? "outline" : "default"}
          size="sm"
          className="rounded-full h-12 w-12 shadow-lg"
          onClick={() => {
            if (!isExpanded) {
              setIsExpanded(true)
            } else {
              setIsOpen(true)
            }
          }}
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      </div>

      {/* Geri Bildirim Modalı */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Geri Bildirim Gönder</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Geri bildirim türü</Label>
              <RadioGroup
                value={feedbackType}
                onValueChange={(value) => setFeedbackType(value as FeedbackType)}
                className="flex flex-wrap gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bug" id="bug" />
                  <Label htmlFor="bug">Hata Bildirimi</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="feature" id="feature" />
                  <Label htmlFor="feature">Özellik İsteği</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="question" id="question" />
                  <Label htmlFor="question">Soru</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="praise" id="praise" />
                  <Label htmlFor="praise">Övgü</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Diğer</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mesajınız</Label>
              <Textarea
                id="message"
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder="Geri bildiriminizi buraya yazın..."
                rows={4}
              />
            </div>

            {(feedbackType === "praise" || feedbackType === "other") && (
              <div className="space-y-2">
                <Label>Değerlendirme</Label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={`p-1 ${feedbackRating === rating ? "text-yellow-500" : "text-gray-300"}`}
                      onClick={() => setFeedbackRating(rating as FeedbackRating)}
                    >
                      <Star className="h-6 w-6 fill-current" />
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              İptal
            </Button>
            <Button onClick={submitFeedback} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Gönder
                </>
              )}
            </Button>
          </CardFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
