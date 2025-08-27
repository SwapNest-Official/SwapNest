"use client"

import { useState, useEffect, useRef } from "react"
import { ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight, X, Maximize2, Minimize2 } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useTheme } from "../contexts/ThemeContext"

function ImageViewer({ images = [], initialIndex = 0, isOpen = false, onClose = () => {} }) {
  const { isDarkMode } = useTheme()
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(0)

  const imageRef = useRef(null)
  const containerRef = useRef(null)
  const viewerRef = useRef(null)

  // Check if fullscreen is supported
  const isFullscreenSupported =
    typeof document !== "undefined" &&
    (document.fullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.mozFullScreenEnabled ||
      document.msFullscreenEnabled)

  // Handle viewport height changes (mobile browser address bar)
  useEffect(() => {
    const updateViewportHeight = () => {
      // Use the actual viewport height, accounting for mobile browser UI
      const vh = window.innerHeight
      setViewportHeight(vh)
      document.documentElement.style.setProperty("--vh", `${vh * 0.01}px`)
    }

    updateViewportHeight()
    window.addEventListener("resize", updateViewportHeight)
    window.addEventListener("orientationchange", updateViewportHeight)

    // Also update on scroll to handle mobile browser address bar hiding/showing
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateViewportHeight()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("resize", updateViewportHeight)
      window.removeEventListener("orientationchange", updateViewportHeight)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Initialize and reset states
  useEffect(() => {
    if (isOpen) {
      setScale(1)
      setPosition({ x: 0, y: 0 })
      setCurrentIndex(initialIndex)
      setIsLoading(true)
      document.body.style.overflow = "hidden"

      // Prevent mobile scroll bounce
      document.body.style.position = "fixed"
      document.body.style.width = "100%"
      document.body.style.height = "100%"

      // Update container size
      setTimeout(() => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect()
          setContainerSize({ width: rect.width, height: rect.height })
        }
      }, 100)
    } else {
      document.body.style.overflow = "unset"
      document.body.style.position = "unset"
      document.body.style.width = "unset"
      document.body.style.height = "unset"

      // Exit fullscreen when closing viewer
      if (isFullscreen) {
        exitFullscreen()
      }
    }

    return () => {
      document.body.style.overflow = "unset"
      document.body.style.position = "unset"
      document.body.style.width = "unset"
      document.body.style.height = "unset"
    }
  }, [isOpen, initialIndex])

  // Reset when switching images
  useEffect(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
    setIsLoading(true)
  }, [currentIndex])

  // Update container size on resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setContainerSize({ width: rect.width, height: rect.height })
      }
    }

    const debouncedResize = debounce(handleResize, 100)
    window.addEventListener("resize", debouncedResize)
    return () => window.removeEventListener("resize", debouncedResize)
  }, [])

  // Simple debounce function
  const debounce = (func, wait) => {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      )
      setIsFullscreen(isCurrentlyFullscreen)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
    document.addEventListener("mozfullscreenchange", handleFullscreenChange)
    document.addEventListener("MSFullscreenChange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange)
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange)
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange)
    }
  }, [])

  const enterFullscreen = async () => {
    if (!isFullscreenSupported || !viewerRef.current) return

    try {
      if (viewerRef.current.requestFullscreen) {
        await viewerRef.current.requestFullscreen()
      } else if (viewerRef.current.webkitRequestFullscreen) {
        await viewerRef.current.webkitRequestFullscreen()
      } else if (viewerRef.current.mozRequestFullScreen) {
        await viewerRef.current.mozRequestFullScreen()
      } else if (viewerRef.current.msRequestFullscreen) {
        await viewerRef.current.msRequestFullscreen()
      }
    } catch (error) {
      console.error("Error entering fullscreen:", error)
    }
  }

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen()
      } else if (document.mozCancelFullScreen) {
        await document.mozCancelFullScreen()
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen()
      }
    } catch (error) {
      console.error("Error exiting fullscreen:", error)
    }
  }

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen()
    } else {
      enterFullscreen()
    }
  }

  const handleImageLoad = (event) => {
    const img = event.target
    const naturalWidth = img.naturalWidth
    const naturalHeight = img.naturalHeight

    // Get actual container dimensions
    const container = containerRef.current
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    // More conservative padding for mobile
    const availableWidth = containerRect.width - 40
    const availableHeight = containerRect.height - 140 // More space for mobile controls

    // Calculate scale to fit entire image within container
    const scaleX = availableWidth / naturalWidth
    const scaleY = availableHeight / naturalHeight
    const fitScale = Math.min(scaleX, scaleY) // Use the smaller scale to ensure full image fits

    // Set the display size to show the complete image
    const displayWidth = naturalWidth * fitScale
    const displayHeight = naturalHeight * fitScale

    setImageSize({ width: displayWidth, height: displayHeight })
    setIsLoading(false)
  }

  // Gentler zoom increments
  const zoomIn = () => {
    setScale((prev) => Math.min(prev * 1.15, 4))
  }

  const zoomOut = () => {
    setScale((prev) => {
      const newScale = Math.max(prev / 1.15, 0.3)
      if (newScale <= 1) {
        setPosition({ x: 0, y: 0 })
      }
      return newScale
    })
  }

  const resetZoom = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleDoubleClick = () => {
    if (scale === 1) {
      setScale(2)
    } else {
      resetZoom()
    }
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  const calculatePanBoundaries = () => {
    if (scale <= 1) return { maxX: 0, maxY: 0 }

    const scaledWidth = imageSize.width * scale
    const scaledHeight = imageSize.height * scale
    const containerWidth = containerSize.width || window.innerWidth
    const containerHeight = containerSize.height || window.innerHeight

    const overflowX = Math.max(0, (scaledWidth - containerWidth) / 2)
    const overflowY = Math.max(0, (scaledHeight - containerHeight) / 2)

    return { maxX: overflowX, maxY: overflowY }
  }

  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      })
      e.preventDefault()
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      const boundaries = calculatePanBoundaries()

      setPosition({
        x: Math.max(-boundaries.maxX, Math.min(boundaries.maxX, newX)),
        y: Math.max(-boundaries.maxY, Math.min(boundaries.maxY, newY)),
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e) => {
    if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      })
    }
  }

  const handleTouchMove = (e) => {
    if (isDragging && scale > 1 && e.touches.length === 1) {
      e.preventDefault()
      const newX = e.touches[0].clientX - dragStart.x
      const newY = e.touches[0].clientY - dragStart.y
      const boundaries = calculatePanBoundaries()

      setPosition({
        x: Math.max(-boundaries.maxX, Math.min(boundaries.maxX, newX)),
        y: Math.max(-boundaries.maxY, Math.min(boundaries.maxY, newY)),
      })
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return

      switch (e.key) {
        case "Escape":
          if (isFullscreen) {
            exitFullscreen()
          } else {
            onClose()
          }
          break
        case "ArrowLeft":
          goToPrevious()
          break
        case "ArrowRight":
          goToNext()
          break
        case "+":
        case "=":
          zoomIn()
          break
        case "-":
          zoomOut()
          break
        case "0":
          resetZoom()
          break
        case "f":
        case "F":
          toggleFullscreen()
          break
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isOpen, isDragging, dragStart, scale, images.length, isFullscreen])

  if (!images || images.length === 0) {
    return null
  }

  const currentImage = images[currentIndex]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-none max-h-none w-screen border-0 overflow-hidden p-0"
        style={{
          height: viewportHeight ? `${viewportHeight}px` : "100vh",
          background: isDarkMode 
            ? "linear-gradient(135deg, rgb(17, 24, 39) 0%, rgb(0, 0, 0) 50%, rgb(17, 24, 39) 100%)"
            : "linear-gradient(135deg, rgb(17, 24, 39) 0%, rgb(0, 0, 0) 50%, rgb(17, 24, 39) 100%)",
        }}
      >
        <div
          ref={viewerRef}
          className={`relative w-full h-full ${isFullscreen ? "bg-black" : ""}`}
          style={{
            height: viewportHeight ? `${viewportHeight}px` : "100vh",
            // Add safe area padding for devices with notches
            paddingTop: "env(safe-area-inset-top)",
            paddingBottom: "env(safe-area-inset-bottom)",
            paddingLeft: "env(safe-area-inset-left)",
            paddingRight: "env(safe-area-inset-right)",
          }}
        >
          {/* TOP CONTROLS BAR - Mobile optimized */}
          <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/95 via-black/80 to-transparent backdrop-blur-xl border-b border-white/10">
            <div
              className="flex items-center justify-between px-2 py-2 sm:p-4 lg:p-6"
              style={{
                paddingTop: "max(8px, env(safe-area-inset-top))",
                paddingLeft: "max(8px, env(safe-area-inset-left))",
                paddingRight: "max(8px, env(safe-area-inset-right))",
              }}
            >
              {/* Left side - Image counter */}
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-white font-semibold border border-white/20 shadow-lg">
                  <span className="text-xs sm:text-sm lg:text-base">
                    {currentIndex + 1} of {images.length}
                  </span>
                </div>
              </div>

              {/* Right side - Controls */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Desktop zoom controls */}
                <div className="hidden sm:flex items-center gap-1 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-full px-3 py-2 border border-white/20 shadow-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={zoomOut}
                    className="text-white hover:bg-white/20 hover:scale-110 h-8 w-8 p-0 rounded-full transition-all duration-200"
                    disabled={scale <= 0.3}
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </Button>
                  <span className="text-white text-xs min-w-[50px] text-center font-semibold px-2">
                    {Math.round(scale * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={zoomIn}
                    className="text-white hover:bg-white/20 hover:scale-110 h-8 w-8 p-0 rounded-full transition-all duration-200"
                    disabled={scale >= 4}
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </Button>
                  <div className="w-px h-5 bg-white/20 mx-1"></div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetZoom}
                    className="text-white hover:bg-white/20 hover:scale-110 h-8 w-8 p-0 rounded-full transition-all duration-200"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                  {/* Fullscreen button */}
                  {isFullscreenSupported && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleFullscreen}
                      className="text-white hover:bg-white/20 hover:scale-110 h-8 w-8 p-0 rounded-full transition-all duration-200"
                      title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}
                    >
                      {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                    </Button>
                  )}
                </div>

                {/* Mobile zoom controls - Compact */}
                <div className="flex sm:hidden items-center gap-1 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-full px-2 py-1.5 border border-white/20 shadow-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={zoomOut}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full transition-all duration-200"
                    disabled={scale <= 0.3}
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </Button>
                  <span className="text-white text-xs min-w-[35px] text-center font-semibold">
                    {Math.round(scale * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={zoomIn}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full transition-all duration-200"
                    disabled={scale >= 4}
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </Button>
                  {/* Mobile fullscreen button */}
                  {isFullscreenSupported && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleFullscreen}
                      className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full transition-all duration-200"
                      title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    >
                      {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                    </Button>
                  )}
                </div>

                {/* Close button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-red-500/20 hover:scale-110 bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-md rounded-full h-8 w-8 sm:h-9 sm:w-9 p-0 border border-red-500/30 shadow-lg transition-all duration-200 ml-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* MAIN IMAGE CONTAINER */}
          <div
            ref={containerRef}
            className="absolute inset-0 flex items-center justify-center overflow-hidden"
            style={{
              cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "default",
              paddingTop: "70px", // Reduced for mobile
              paddingBottom: images.length > 1 ? "90px" : "20px", // Reduced for mobile
              paddingLeft: "10px",
              paddingRight: "10px",
            }}
          >
            {/* Loading spinner */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="relative">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 border-3 sm:border-4 border-white/20 border-t-blue-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 border-3 sm:border-4 border-transparent border-r-purple-500 rounded-full animate-spin animate-reverse"></div>
                </div>
              </div>
            )}

            {/* Image */}
            <img
              ref={imageRef}
              src={currentImage || "/placeholder.svg?height=800&width=1200"}
              alt={`Image ${currentIndex + 1}`}
              className={`select-none transition-all duration-500 ease-out rounded-lg shadow-2xl ${
                isLoading ? "opacity-0 scale-95" : "opacity-100 scale-100"
              }`}
              style={{
                width: `${imageSize.width}px`,
                height: `${imageSize.height}px`,
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                transformOrigin: "center center",
                filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.4))",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onDoubleClick={handleDoubleClick}
              onLoad={handleImageLoad}
              draggable={false}
            />
          </div>

          {/* NAVIGATION ARROWS - Mobile optimized */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="lg"
                onClick={goToPrevious}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 hover:scale-110 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-full h-12 w-12 sm:h-14 sm:w-14 p-0 border border-white/20 shadow-xl transition-all duration-300"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={goToNext}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 hover:scale-110 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-full h-12 w-12 sm:h-14 sm:w-14 p-0 border border-white/20 shadow-xl transition-all duration-300"
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            </>
          )}

          {/* THUMBNAIL STRIP - Mobile optimized */}
          {images.length > 1 && (
            <div
              className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/95 via-black/80 to-transparent backdrop-blur-xl border-t border-white/10"
              style={{
                paddingBottom: "env(safe-area-inset-bottom)",
              }}
            >
              <div className="p-2 sm:p-4">
                <div className="flex justify-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-lg overflow-hidden border-2 transition-all duration-300 shadow-lg ${
                        index === currentIndex
                          ? "border-blue-400 scale-110 shadow-blue-500/25 ring-1 ring-blue-400/50"
                          : "border-white/30 hover:border-white/70 hover:scale-105 hover:shadow-white/20"
                      }`}
                    >
                      <img
                        src={image || "/placeholder.svg?height=72&width=72"}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover transition-all duration-300"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* HELP TEXT - Mobile optimized */}
          <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 text-white/60 text-xs sm:text-sm text-center px-4">
            <div className="bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2 border border-white/10">
              <p className="sm:hidden">Double tap to zoom • Drag to pan</p>
              <p className="hidden sm:block">
                Double click to zoom • Drag to pan • Arrow keys to navigate • Press F for fullscreen
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ImageViewer
