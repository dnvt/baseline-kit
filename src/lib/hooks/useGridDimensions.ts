import { useLayoutEffect, useState, type RefObject } from 'react'
import type { GridDimensions } from '@types'

export function useGridDimensions(
  ref: RefObject<HTMLDivElement | null>,
): GridDimensions {
  const [dimensions, setDimensions] = useState<GridDimensions>({
    width: 0,
    height: 0,
  })

  useLayoutEffect(() => {
    if (!ref.current) return

    const updateDimensions = () => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      setDimensions(prev => {
        const next = {
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        }
        return prev.width === next.width && prev.height === next.height
          ? prev
          : next
      })
    }

    const observer = new ResizeObserver(updateDimensions)
    observer.observe(ref.current)
    updateDimensions()

    return () => observer.disconnect()
  }, [ref])

  return dimensions
}
