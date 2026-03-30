import * as React from 'react'
import type { GuideConfig } from '@baseline-kit/core'
import { calculateGuideTemplate } from '@baseline-kit/core'
import { useMeasure } from './useMeasure'

export type { GuideResult } from '@baseline-kit/core'

/**
 * Hook for calculating grid layout parameters based on container dimensions.
 */
export function useGuide(
  ref: React.RefObject<HTMLElement | null>,
  config: GuideConfig
) {
  const { width } = useMeasure(ref)
  return React.useMemo(() => calculateGuideTemplate(width, config), [config, width])
}
