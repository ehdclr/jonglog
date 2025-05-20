"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// ImageCarouselProps 인터페이스를 수정합니다:
interface ImageCarouselProps {
  images: Array<{
    id: string
    name: string
    preview: string | null
    base64?: string | null
    url?: string
  }>
  onInsertImage?: (image: any) => void
  currentImageId?: string | null
  onImageSelect?: (id: string) => void
}

// 컴포넌트 함수 시그니처를 수정합니다:
export function ImageCarousel({ images, onInsertImage, currentImageId, onImageSelect }: ImageCarouselProps) {
  // 내부 상태 관리를 수정합니다:
  const [direction, setDirection] = useState(0)
  const [fallbackImage] = useState("/abstract-colorful-swirls.png")
  const [isAnimating, setIsAnimating] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)

  // 현재 인덱스 계산 로직을 수정합니다:
  const currentIndex = currentImageId
    ? images.findIndex((img) => img.id === currentImageId)
    : images.length > 0
      ? 0
      : -1

  // 이미지 URL 가져오기 로직을 수정합니다:
  const imageUrl =
    currentIndex >= 0 && currentIndex < images.length
      ? images[currentIndex].url || images[currentIndex].preview || fallbackImage
      : fallbackImage

  // 인덱스 변경 함수를 수정합니다:
  const updateIndex = useCallback(
    (newIndex: number, newDirection: number) => {
      if (isAnimating || newIndex < 0 || newIndex >= images.length) return

      setIsAnimating(true)
      setDirection(newDirection)

      if (onImageSelect && images[newIndex]) {
        onImageSelect(images[newIndex].id)
      }
    },
    [images, onImageSelect, isAnimating],
  )

  // 이전/다음 이미지 이동 함수를 수정합니다:
  const goToPrevious = useCallback(() => {
    if (images.length <= 1) return
    const newIndex = currentIndex <= 0 ? images.length - 1 : currentIndex - 1
    updateIndex(newIndex, -1)
  }, [currentIndex, images.length, updateIndex])

  const goToNext = useCallback(() => {
    if (images.length <= 1) return
    const newIndex = currentIndex >= images.length - 1 ? 0 : currentIndex + 1
    updateIndex(newIndex, 1)
  }, [currentIndex, images.length, updateIndex])

  // 특정 인덱스로 이동하는 함수를 수정합니다:
  const goToIndex = useCallback(
    (index: number) => {
      if (index === currentIndex || index < 0 || index >= images.length) return
      updateIndex(index, index > currentIndex ? 1 : -1)
    },
    [currentIndex, images.length, updateIndex],
  )

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrevious()
      } else if (e.key === "ArrowRight") {
        goToNext()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [goToPrevious, goToNext])

  // 애니메이션 완료 핸들러
  const handleAnimationComplete = () => {
    setIsAnimating(false)
  }

  // 이미지가 없으면 렌더링하지 않음
  if (images.length === 0) {
    return null
  }

  // 슬라이드 애니메이션 변형 - 속도 개선
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  }

  // 슬라이드 트랜지션 - 속도 개선
  const transition = {
    type: "tween", // spring에서 tween으로 변경하여 속도 개선
    duration: 0.2, // 애니메이션 시간 단축
    ease: "easeInOut",
    onComplete: handleAnimationComplete,
  }

  // 터치 스와이프 처리
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAnimating) return

    const touchStartX = e.touches[0].clientX
    const touchThreshold = 50

    const handleTouchMove = (e: TouchEvent) => {
      if (isAnimating) return

      const touchCurrentX = e.touches[0].clientX
      const diff = touchStartX - touchCurrentX

      if (Math.abs(diff) > touchThreshold) {
        if (diff > 0) {
          goToNext()
        } else {
          goToPrevious()
        }
        window.removeEventListener("touchmove", handleTouchMove)
      }
    }

    window.addEventListener("touchmove", handleTouchMove, { passive: true })
    window.addEventListener(
      "touchend",
      () => {
        window.removeEventListener("touchmove", handleTouchMove)
      },
      { once: true },
    )
  }

  return (
    <div
      className="relative w-full aspect-video bg-muted rounded-md overflow-hidden"
      ref={carouselRef}
      onTouchStart={handleTouchStart}
    >
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={transition}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={images[currentIndex]?.name || "이미지"}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.src = fallbackImage
            }}
          />
        </motion.div>
      </AnimatePresence>

      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full h-8 w-8 z-10 hover:bg-background/90 transition-all"
            onClick={goToPrevious}
            disabled={isAnimating}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full h-8 w-8 z-10 hover:bg-background/90 transition-all"
            onClick={goToNext}
            disabled={isAnimating}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* 이미지 삽입 버튼을 수정합니다: */}
      {onInsertImage && currentIndex >= 0 && (
        <Button
          variant="secondary"
          size="sm"
          className="absolute bottom-2 right-2 z-10"
          onClick={() => onInsertImage(images[currentIndex])}
        >
          본문에 삽입
        </Button>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-2 left-2 bg-background/80 px-2 py-1 rounded-md text-xs z-10">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* 썸네일 네비게이션 부분을 수정합니다: */}
      {images.length > 1 && (
        <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-1 pb-2">
          <div className="flex gap-1 px-2 py-1 bg-background/80 rounded-full">
            {images.map((_, index) => (
              <button
                key={images[index].id}
                onClick={() => goToIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? "bg-primary scale-125" : "bg-muted-foreground/50 hover:bg-muted-foreground"
                }`}
                aria-label={`이미지 ${index + 1}로 이동`}
                disabled={isAnimating}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
