/**
 * Combines class names, filtering out falsy values.
 * Lightweight alternative to clsx/classnames.
 */
export const cx = (
  ...classes: Array<string | boolean | undefined | null>
): string => classes.filter(Boolean).join(' ').trim()

export type StyleOverrideParams = {
  key: string
  value: string
  defaultStyles: Record<string, string>
  skipDimensions?: {
    fitContent?: string[]
    auto?: string[]
    fullSize?: string[]
  }
}

export function createStyleOverride(
  params: StyleOverrideParams | string,
  value?: string,
  defaultStyles?: Record<string, string>
): Record<string, string> {
  const key = typeof params === 'string' ? params : params.key
  const val = typeof params === 'string' ? value! : params.value
  const defaults =
    typeof params === 'string' ? defaultStyles! : params.defaultStyles
  const skipDimensions =
    typeof params === 'object' ? params.skipDimensions : undefined

  if (skipDimensions) {
    if (skipDimensions.fitContent?.includes(key) && val === 'fit-content') {
      return {}
    }
    if (skipDimensions.auto?.includes(key) && val === 'auto') {
      return {}
    }
    if (
      skipDimensions.fullSize?.includes(key) &&
      (val === '100%' || val === '100vh' || val === '100vw')
    ) {
      return {}
    }
  }

  return val !== defaults[key] ? { [key]: val } : {}
}
