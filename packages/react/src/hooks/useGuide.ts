import * as React from 'react'
import type { GuideConfig } from '@baseline-kit/core/types'
import { calculateGuideTemplate } from '@baseline-kit/core/utils/grid'
import { isRootRelative } from '@baseline-kit/core/utils/parse'
import { getViewportContext } from '@baseline-kit/dom/viewport'
import { useMeasure } from './useMeasure'
import { useRootFontSize } from './useRootFontSize'

export type { GuideResult } from '@baseline-kit/core/utils/grid'

/**
 * Hook for calculating grid layout parameters based on container dimensions.
 * A gap or column width in rem follows the root font size.
 */
export function useGuide(
  ref: React.RefObject<HTMLElement | null>,
  config: GuideConfig
) {
  const { width } = useMeasure(ref)
  const rootFontSize = useRootFontSize(
    isRootRelative(config.gap) ||
      ('columnWidth' in config && isRootRelative(config.columnWidth))
  )
  return React.useMemo(
    () => calculateGuideTemplate(width, config, getViewportContext()),
    // getViewportContext reads the root font size; re-read when it changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config, width, rootFontSize]
  )
}
