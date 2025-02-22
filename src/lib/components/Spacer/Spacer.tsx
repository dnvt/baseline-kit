/**
 * @file Spacer Component
 * @description Flexible spacing element with measurement indicators
 * @module components
 */

import * as React from 'react'
import { useConfig, useDebug } from '@hooks'
import { mergeStyles, mergeClasses, formatValue, normalizeValuePair } from '@utils'
import { ComponentsProps, Variant } from '../types'
import styles from './styles.module.css'

export type IndicatorNode = (
  value: number,
  dimension: 'width' | 'height',
) => React.ReactNode

export type SpacerProps = {
  /** Render function for custom measurement display */
  indicatorNode?: IndicatorNode;
  /** Visual style when debugging is enabled */
  variant?: Variant;
  /** Base unit for measurements (defaults to theme value) */
  base?: number;
  /** Color override for visual indicators */
  color?: string;
} & ComponentsProps

export const Spacer = React.memo(function Spacer({
  height,
  width,
  indicatorNode,
  debugging,
  variant: variantProp,
  base: baseProp,
  color: colorProp,
  className,
  style,
  ...props
}: SpacerProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const config = useConfig('spacer')

  const { isShown } = useDebug(debugging, config.debugging)
  const variant = variantProp ?? config.variant
  const base = baseProp ?? config.base

  const [normWidth, normHeight] = normalizeValuePair(
    [width, height], [0, 0], { base, suppressWarnings: true },
  )

  const measurements = React.useMemo(() => {
    if (!isShown || !indicatorNode) return null

    return [
      normHeight !== 0 && (
        <span key="height">
          {indicatorNode(normHeight, 'height')}
        </span>
      ),
      normWidth !== 0 && (
        <span key="width">
          {indicatorNode(normWidth, 'width')}
        </span>
      ),
    ].filter(Boolean)
  }, [isShown, indicatorNode, normHeight, normWidth])

  // IMPORTANT: Correct default key for spacer base, using "--bk-spacer-base"
  const defaultSpacerStyles: Record<string, string> = React.useMemo(() => ({
    '--bksh': '100%',
    '--bksw': '100%',
    '--bksb': `${config.base}px`,
    '--bksci': 'var(--bk-spacer-color-text-theme)',
    '--bkscl': 'var(--bk-spacer-color-line-theme)',
    '--bkscf': 'var(--bk-spacer-color-flat-theme)',
  }), [config.base])

  const getStyleOverride = React.useCallback(
    (key: string, value: string): Record<string, string | number> => {
      // For width/height, if the computed value is "100%" skip inline injection
      if ((key === '--bksw' || key === '--bksh') && value === '100%') {
        return {}
      }
      return value !== defaultSpacerStyles[key] ? { [key]: value } : {}
    },
    [defaultSpacerStyles],
  )

  const containerStyles = React.useMemo(() => {
    const heightValue = formatValue(normHeight || '100%')
    const widthValue = formatValue(normWidth || '100%')
    const baseValue = `${baseProp || config.base}px`

    const customStyles = {
      ...getStyleOverride('--bksh', heightValue),
      ...getStyleOverride('--bksw', widthValue),
      ...getStyleOverride('--bksb', baseValue),
      ...getStyleOverride(
        '--bksci',
        colorProp ?? config.colors.text,
      ),
      ...getStyleOverride(
        '--bkscl',
        colorProp ?? config.colors.line,
      ),
      ...getStyleOverride(
        '--bkscf',
        colorProp ?? config.colors.flat,
      ),
    } as React.CSSProperties

    return mergeStyles(customStyles, style)
  }, [getStyleOverride, normHeight, normWidth, config.base, colorProp,
    config.colors.text, config.colors.line, config.colors.flat, style])

  return (
    <div
      ref={ref}
      data-testid="spacer"
      className={mergeClasses(styles.spr, isShown && styles[variant], className)}
      data-variant={variant}
      style={containerStyles}
      {...props}
    >
      {measurements}
    </div>
  )
})