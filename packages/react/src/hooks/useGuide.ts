import * as React from 'react'
import type { GuideConfig } from '@baseline-kit/core/types'
import { calculateGuideTemplate } from '@baseline-kit/core/utils/grid'
import { getViewportContext } from '@baseline-kit/dom/viewport'
import { useMeasure } from './useMeasure'

export type { GuideResult } from '@baseline-kit/core/utils/grid'

/**
 * Hook for calculating grid layout parameters based on container dimensions.
 */
export function useGuide(
  ref: React.RefObject<HTMLElement | null>,
  config: GuideConfig
) {
  const { width } = useMeasure(ref)
  return React.useMemo(
    () => calculateGuideTemplate(width, config, getViewportContext()),
    [config, width]
  )
}
