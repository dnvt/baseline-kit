import { useMemo } from 'react'
import { SpacerDimensions } from '@components'
import { CSSPixelValue } from '@types'
import { MeasurementSystem } from '@utils'

interface UseSpacerDimensionsProps {
  height?: CSSPixelValue
  width?: CSSPixelValue
  baseUnit: number
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

    if (height) {
      normalizedHeight = MeasurementSystem.normalize(height, baseUnit)
      dimensions = {
        height: normalizedHeight,
        width: '100%',
      }
    } else if (width) {
      normalizedWidth = MeasurementSystem.normalize(width, baseUnit)
      dimensions = {
        height: '100%',
        width: normalizedWidth,
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
