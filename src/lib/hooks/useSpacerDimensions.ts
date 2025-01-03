import { useMemo } from 'react'
import { SpacerDimensions } from '@components'
import { CSSValue } from '@types'
import { MeasurementSystem } from '@utils'

interface UseSpacerDimensionsProps {
  height?: CSSValue
  width?: CSSValue
  baseUnit: number
  config?: {
    variant?: 'line' | 'flat'
  }
}


interface UseSpacerDimensionsResult {
  dimensions: SpacerDimensions
  normalizedHeight: number | null
  normalizedWidth: number | null
}

export function useSpacerDimensions({
  height,
  width,
  baseUnit,
}: UseSpacerDimensionsProps): UseSpacerDimensionsResult {
  return useMemo(() => {
    let dimensions: SpacerDimensions
    let normalizedHeight: number | null = null
    let normalizedWidth: number | null = null

    const normalizeValue = (value: CSSValue): [CSSValue, number] => {

      // Handle numeric values directly
      if (typeof value === 'number') {
        const normalized = MeasurementSystem.normalize(value, { unit: baseUnit })
        return [`${normalized}px`, normalized]
      }

      // Handle string values
      if (typeof value === 'string') {
        if (value === 'auto' || value === '100%') {
          return [value, baseUnit]
        }

        // Try to normalize if it's a different CSS Unit
        const normalized = MeasurementSystem.normalize(value, { unit: baseUnit })
        return [value, normalized]
      }

      return ['100%', baseUnit]
    }

    if (height !== undefined) {
      const [heightValue, normalized] = normalizeValue(height)
      normalizedHeight = normalized
      dimensions = {
        height: heightValue,
        width: '100%',
      }
    } else if (width !== undefined) {
      const [widthValue, normalized] = normalizeValue(width)
      normalizedWidth = normalized
      dimensions = {
        height: '100%',
        width: widthValue,
      }
    } else {
      dimensions = {
        height: '100%',
        width: '100%',
      }
    }

    return {
      dimensions,
      normalizedHeight,
      normalizedWidth,
    }
  }, [height, width, baseUnit])
}
