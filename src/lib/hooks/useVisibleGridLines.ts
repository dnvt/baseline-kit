import { useState, useCallback, useLayoutEffect, type RefObject } from 'react'
import type { VisibleRange } from '@types'

interface UseVisibleGridLinesProps {
  totalLines: number
  lineHeight: number
  containerRef: RefObject<HTMLDivElement>
  buffer?: number
}

export function useVisibleGridLines({
  totalLines,
  lineHeight,
  containerRef,
  buffer = 160,
}: UseVisibleGridLinesProps): VisibleRange {
  const [visibleRange, setVisibleRange] = useState<VisibleRange>({
    start: 0,
    end: totalLines,
  })

  const calculateRange = useCallback((): VisibleRange => {
    if (!containerRef.current) {
      return { start: 0, end: totalLines }
    }

    const rect = containerRef.current.getBoundingClientRect()
    const viewportTop = Math.max(0, -rect.top)
    const viewportBottom = viewportTop + window.innerHeight

    return {
      start: Math.max(0, Math.floor(viewportTop / lineHeight) - buffer),
      end: Math.min(totalLines, Math.ceil(viewportBottom / lineHeight) + buffer),
    }
  }, [totalLines, lineHeight, containerRef, buffer])

  useLayoutEffect(() => {
    const updateRange = () => {
      setVisibleRange(calculateRange())
    }

    const observer = new IntersectionObserver(updateRange, {
      threshold: 0,
    })

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    window.addEventListener('scroll', updateRange, { passive: true })
    window.addEventListener('resize', updateRange, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', updateRange)
      window.removeEventListener('resize', updateRange)
    }
  }, [calculateRange, containerRef])

  return visibleRange
}
