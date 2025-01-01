import { useMemo } from 'react'
import { CSSPixelValue, CSSValue, isFlatVariant, isLineVariant } from '@types'
import { extractCSSNumber } from '@utils'
import type { SpacerConfig, SpacerDimensions } from './types'

interface UseSpacerDimensionsProps {
  height?: CSSPixelValue
  width?: CSSPixelValue
  baseUnit: number
  config: SpacerConfig
}

interface UseSpacerDimensionsResult {
  dimensions: SpacerDimensions
  normalizedHeight: number | null
  normalizedWidth: number | null
}

function normalizeSpacerSize(size: CSSPixelValue, baseUnit: number) {
  const num = extractCSSNumber(size)
  const normalized = num - (num % baseUnit)

  if (normalized !== num) {
    console.warn(
      `Best to pass a Spacer value as a multiple of the baseUnit.\nConverted: ${num} to ${normalized} to match the baseline`,
    )
  }

  return normalized
}

export function useSpacerDimensions({
  height,
  width,
  baseUnit,
  config,
}: UseSpacerDimensionsProps): UseSpacerDimensionsResult {
  return useMemo(() => {
    let dimensions: SpacerDimensions
    let normalizedHeight: number | null = null
    let normalizedWidth: number | null = null

    if (isLineVariant(config)) {
      dimensions = {
        height: '100%',
        width: '100%',
      }
    } else {
      if (height) {
        normalizedHeight = normalizeSpacerSize(height, baseUnit)
        dimensions = {
          height: normalizedHeight,
          width: '100%',
        }
      } else if (width) {
        normalizedWidth = normalizeSpacerSize(width, baseUnit)
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
    }

    return {
      dimensions,
      normalizedHeight,
      normalizedWidth,
    }
  }, [height, width, baseUnit, config])
}
