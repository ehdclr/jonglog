"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageCarouselProps {
  images: Array<{
    id: string
    name: string
    preview: string | null
    base64?: string | null
    url?: string
  }>
  onInsertImage?: (image: any) => void
}

export function ImageCarousel({ images, onInsertImage }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fallbackImage] = useState("/abstract-colorful-swirls.png")

  if (images.length === 0) {
    return null
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1))
  }

  const currentImage = images[currentIndex]
  // Use base64 if available, otherwise fall back to other sources
  const imageUrl = currentImage.base64 || currentImage.url || currentImage.preview || fallbackImage

  return (
    <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden">
      <img
        src={imageUrl || "/placeholder.svg"}
        alt={currentImage.name}
        className="w-full h-full object-contain"
        onError={(e) => {
          e.currentTarget.src = fallbackImage
        }}
      />

      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full h-8 w-8"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full h-8 w-8"
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {onInsertImage && (
        <Button
          variant="secondary"
          size="sm"
          className="absolute bottom-2 right-2"
          onClick={() => onInsertImage(currentImage)}
        >
          본문에 삽입
        </Button>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-2 left-2 bg-background/80 px-2 py-1 rounded-md text-xs">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  )
}
