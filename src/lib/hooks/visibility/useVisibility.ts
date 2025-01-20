import { useMemo } from 'react'
import { Visibility } from '@components'

export function useVisibility(
  visibilityProp?: Visibility,
  configVisibility?: Visibility,
) {
  return useMemo(() => ({
    isShown: (visibilityProp ?? configVisibility) === 'visible',
    isHidden: (visibilityProp ?? configVisibility) === 'hidden',
    isNone: (visibilityProp ?? configVisibility) === 'none',
  }), [visibilityProp, configVisibility])
}