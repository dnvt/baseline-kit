import {
  RefObject,
  useCallback,
  useLayoutEffect,
  useState,
} from 'react'
import { rafThrottle } from '@utils'

type Props = {
  /** Total lines for a horizontal guide, or total columns for vertical, etc. */
  totalLines: number
  /** Pixel size of each "step" (row height if horizontal, etc.). */
  lineHeight: number
  /** The container whose offset on the page we track. */
  containerRef: RefObject<HTMLDivElement | null>
  /** Extra pixel buffer above/below. */
  buffer?: number | string
}

export function useGuideVisibleLines({ totalLines, lineHeight, containerRef }: Props) {
  const calculateRange = useCallback(() => {
    const element = containerRef.current
    if (!element) return { start: 0, end: totalLines }
    if (element.closest('.content-block')) return { start: 0, end: totalLines }

    const rect = element.getBoundingClientRect()
    const offsetTop = rect.top + window.scrollY
    const viewportTop = Math.max(0, window.scrollY - offsetTop)
    const viewportBottom = viewportTop + window.innerHeight

    return {
      start: Math.max(0, Math.floor(viewportTop / lineHeight)),
      end: Math.min(totalLines, Math.ceil(viewportBottom / lineHeight)),
    }
  }, [totalLines, lineHeight, containerRef])

  const [visibleRange, setVisibleRange] = useState(calculateRange)

  useLayoutEffect(() => {
    const updateRange = rafThrottle(() => setVisibleRange(calculateRange()))
    const observer = containerRef.current
      ? new IntersectionObserver(updateRange, { threshold: 0 })
      : null

    window.addEventListener('scroll', updateRange, { passive: true })
    window.addEventListener('resize', updateRange, { passive: true })
    if (observer && containerRef.current) observer.observe(containerRef.current)

    updateRange()

    return () => {
      window.removeEventListener('scroll', updateRange)
      window.removeEventListener('resize', updateRange)
      observer?.disconnect()
    }
  }, [calculateRange, containerRef])

  return visibleRange
}