import { RefObject, useEffect, useLayoutEffect, useState } from 'react'
import type { SnappingMode } from '@components'

export type PaddingSnapFn = (
  padding: number,
  snapping: SnappingMode,
  base: number,
  ref: RefObject<HTMLDivElement | null>,
) => number

export const usePaddingSnap: PaddingSnapFn = (
  padding,
  snapping,
  base,
  ref,
) => {
  const [snappedPadding, setSnappedPadding] = useState(padding)

  if (base < 1) {
    throw new Error('Base must be greater than or equal to 1')
  }

  useLayoutEffect(() => {
    if (!ref.current || snapping === 'none') {
      setSnappedPadding(padding)
      return
    }

    const boxHeight = ref.current.offsetHeight
    const remainder = boxHeight % base

    if (snapping === 'clamp') {
      // 1. First get the clamped value
      let newPadding = padding % base
      if (newPadding === 0) newPadding = base

      // 2. If height needs adjustment, add difference
      if (remainder !== 0) {
        const difference = base - remainder
        newPadding += difference
      }

      // 3. Always ensure final value is clamped in clamp mode
      newPadding = newPadding % base || base

      setSnappedPadding(newPadding)
    } else {
      if (remainder !== 0) {
        const difference = base - remainder
        setSnappedPadding(padding + difference)
      } else {
        setSnappedPadding(padding)
      }
    }
  }, [ref, base, padding, snapping])

  return snappedPadding
}

