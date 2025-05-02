"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Pause, Volume2, VolumeX, Maximize, Loader } from "lucide-react"
import { cn } from "@/lib/utils"

interface VideoPlayerProps {
  videoUrl: string
  title?: string
  posterUrl?: string
  className?: string
}

export function VideoPlayer({ videoUrl, title, posterUrl, className }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  // YouTube video ID'sini çıkar
  const getYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const isYouTubeVideo = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")
  const youtubeId = isYouTubeVideo ? getYouTubeId(videoUrl) : null

  // YouTube embed URL'ini oluştur
  const getYouTubeEmbedUrl = (id: string): string => {
    return `https://www.youtube.com/embed/${id}?autoplay=0&enablejsapi=1&modestbranding=1&rel=0`
  }

  // Yerel video için zaman formatı
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Yerel video kontrolü
  const handleVideoPlay = () => {
    const video = document.getElementById("local-video") as HTMLVideoElement
    if (video) {
      if (isPlaying) {
        video.pause()
      } else {
        video.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Yerel video ses kontrolü
  const handleVideoMute = () => {
    const video = document.getElementById("local-video") as HTMLVideoElement
    if (video) {
      video.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  // Yerel video tam ekran
  const handleFullScreen = () => {
    const video = document.getElementById("local-video") as HTMLVideoElement
    if (video) {
      if (video.requestFullscreen) {
        video.requestFullscreen()
      }
    }
  }

  // Yerel video ilerleme çubuğu
  const handleTimeUpdate = () => {
    const video = document.getElementById("local-video") as HTMLVideoElement
    if (video) {
      setCurrentTime(video.currentTime)
      setProgress((video.currentTime / video.duration) * 100)
    }
  }

  // Yerel video yükleme
  const handleVideoLoaded = () => {
    const video = document.getElementById("local-video") as HTMLVideoElement
    if (video) {
      setDuration(video.duration)
      setIsLoading(false)
    }
  }

  // Yerel video ilerleme çubuğu tıklama
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = document.getElementById("local-video") as HTMLVideoElement
    if (video) {
      const progressBar = e.currentTarget
      const rect = progressBar.getBoundingClientRect()
      const pos = (e.clientX - rect.left) / progressBar.offsetWidth
      video.currentTime = pos * video.duration
    }
  }

  // YouTube video için
  if (isYouTubeVideo && youtubeId) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-0">
          <div className="aspect-video w-full">
            <iframe
              src={getYouTubeEmbedUrl(youtubeId)}
              title={title || "YouTube video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            ></iframe>
          </div>
          {title && <div className="p-4 font-medium">{title}</div>}
        </CardContent>
      </Card>
    )
  }

  // Yerel video için
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-0 relative">
        <div className="aspect-video w-full bg-black relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader className="h-8 w-8 text-white animate-spin" />
            </div>
          )}
          <video
            id="local-video"
            src={videoUrl}
            poster={posterUrl}
            className="w-full h-full"
            onTimeUpdate={handleTimeUpdate}
            onLoadedData={handleVideoLoaded}
            onLoadedMetadata={handleVideoLoaded}
          ></video>

          {/* Video kontrolleri */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white opacity-0 hover:opacity-100 transition-opacity">
            <div className="h-1 bg-gray-500 rounded-full mb-2 cursor-pointer" onClick={handleProgressClick}>
              <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleVideoPlay}
                  className="p-1 rounded-full hover:bg-white/20 transition-colors"
                  aria-label={isPlaying ? "Duraklat" : "Oynat"}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
                <button
                  onClick={handleVideoMute}
                  className="p-1 rounded-full hover:bg-white/20 transition-colors"
                  aria-label={isMuted ? "Sesi Aç" : "Sesi Kapat"}
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                <span className="text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              <button
                onClick={handleFullScreen}
                className="p-1 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Tam Ekran"
              >
                <Maximize className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        {title && <div className="p-4 font-medium">{title}</div>}
      </CardContent>
    </Card>
  )
}
