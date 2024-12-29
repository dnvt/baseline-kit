import { useEffect, useState } from 'react'
import { round } from '@/utils'

interface ChromePerformance extends Performance {
  memory?: {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  }
}

interface PerformanceMetrics {
  fps: number
  memory: number
  elements: number
}

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memory: 0,
    elements: 0,
  })

  useEffect(() => {
    let frames = 0
    let lastTime = performance.now()
    let animationFrameId: number

    const measureFPS = () => {
      frames++
      const now = performance.now()

      // Check if one second has passed
      if (now - lastTime >= 1000) {
        const currentFPS = round(frames, 1)
        setMetrics({
          fps: currentFPS,
          // Convert used JS heap size from bytes to MB
          memory: round(
            ((performance as ChromePerformance).memory?.usedJSHeapSize || 0) /
            1048576,
            2,
          ),
          // Count elements with specific data attributes
          elements: document.querySelectorAll(
            '[data-row-index], [data-column-index]',
          ).length,
        })
        frames = 0 // Reset frame counter
        lastTime = now // Update the last measurement timestamp
      }

      // Request the next animation frame
      animationFrameId = requestAnimationFrame(measureFPS)
    }

    // Start the animation frame loop
    animationFrameId = requestAnimationFrame(measureFPS)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return metrics
}
