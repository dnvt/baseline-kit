import { useMemo } from 'react'
import { MeasurementSystem, type CSSValue } from '@utils'

type DimensionConfig = {
  base: number
  suppressWarnings?: boolean
}

type DimensionOptions = {
  defaultWidth?: number
  defaultHeight?: number
  config?: DimensionConfig
}

export function useDimensions(
  width?: CSSValue,
  height?: CSSValue,
  { defaultWidth = 0, defaultHeight = 0, config = { base: 8 } }: DimensionOptions = {},
) {
  return useMemo(() => {
    const normalizedWidth = MeasurementSystem.normalizeDimension(width, defaultWidth, config)
    const normalizedHeight = MeasurementSystem.normalizeDimension(height, defaultHeight, config)
    const widthValue = width ? `${normalizedWidth}px` : '100%'
    const heightValue = height ? `${normalizedHeight}px` : '100%'

    return {
      width: widthValue,
      height: heightValue,
      normalizedWidth,
      normalizedHeight,
      cssProps: {
        '--dimension-width': widthValue,
        '--dimension-height': heightValue,
      },
    }
  }, [width, height, defaultWidth, defaultHeight, config.base])
}
