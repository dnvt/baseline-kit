import { useMemo } from 'react'
import { SpacerDimensions } from '@components'
import { CSSValue, MeasurementSystem } from '@utils'

type Props = {
  height?: CSSValue | '100%'
  width?: CSSValue | '100%'
  base: number
  config?: {
    variant?: 'line' | 'flat'
  }
}

type Result = {
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
 * @param base - The base unit for normalization.
 * @returns An object containing the calculated dimensions and normalized height/width values.
 */
export function useSpacerDimensions({ height, width, base }: Props): Result {
  return useMemo(() => {
    const normalizeValue = (value: CSSValue): [CSSValue, number] => {
      if (typeof value === 'number') {
        const normalized = MeasurementSystem.normalize(value, { unit: base })
        return [`${normalized}px`, normalized]
      }

      if (value === 'auto' || value === '100%') return [value, base]

      const normalized = MeasurementSystem.normalize(value, { unit: base })
      return [typeof value === 'string' ? value : '100%', normalized]
    }

    const dimensions: SpacerDimensions = {
      height: height ? normalizeValue(height)[0] : '100%',
      width: width ? normalizeValue(width)[0] : '100%',
    }

    return {
      dimensions,
      normalizedHeight: height ? normalizeValue(height)[1] : null,
      normalizedWidth: width ? normalizeValue(width)[1] : null,
    }
  }, [height, width, base])
}
