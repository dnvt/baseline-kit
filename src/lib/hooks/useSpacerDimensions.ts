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

/**
 * Hook for calculating and normalizing spacer dimensions.
 * Handles numeric and CSS string values for height and width, normalizing them to a base unit.
 *
 * @param height - The height of the spacer.
 * @param width - The width of the spacer.
 * @param baseUnit - The base unit for normalization.
 * @returns An object containing the calculated dimensions and normalized height/width values.
 */
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
      if (typeof value === 'number') {
        const normalized = MeasurementSystem.normalize(value, { unit: baseUnit })
        return [`${normalized}px`, normalized]
      }

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
