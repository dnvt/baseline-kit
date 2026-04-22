import type { SnappingMode, Padding, PaddingValue } from '../types'
import { parsePadding } from './padding'

export function calculateSnappedSpacing(
  height: number,
  base: number,
  initial: PaddingValue,
  snapping: SnappingMode
): Padding {
  const pad: Padding = parsePadding({ padding: initial })

  if (snapping === 'none') {
    return pad
  }

  if (snapping === 'height') {
    const remainder = height % base
    if (remainder !== 0) {
      pad.bottom += base - remainder
    }
  }

  if (snapping === 'clamp') {
    pad.top = pad.top % base
    const remainder = height % base
    if (remainder !== 0) {
      pad.bottom += base - remainder
    }
    pad.bottom = pad.bottom % base
  }

  return pad
}
