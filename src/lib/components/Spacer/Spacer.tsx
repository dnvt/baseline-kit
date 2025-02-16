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
    [width, height],
    [0, 0],
    { base, suppressWarnings: true },
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
    '--bk-spacer-height': 'var(--bk-height-full)',
    '--bk-spacer-width': 'var(--bk-width-full)',
    '--bk-spacer-base': `${config.base}px`,
    '--bk-spacer-color-indice': 'var(--bk-spacer-color-indice-theme)',
    '--bk-spacer-color-line': 'var(--bk-spacer-color-line-theme)',
    '--bk-spacer-color-flat': 'var(--bk-spacer-color-flat-theme)',
  }), [config.base])

  const getStyleOverride = React.useCallback(
    (key: string, value: string): Record<string, string | number> => {
      // For width/height, if the computed value is "100%" skip inline injection
      if ((key === '--bk-spacer-width' || key === '--bk-spacer-height') && value === '100%') {
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
      ...getStyleOverride('--bk-spacer-height', heightValue),
      ...getStyleOverride('--bk-spacer-width', widthValue),
      ...getStyleOverride('--bk-spacer-base', baseValue),
      ...getStyleOverride(
        '--bk-spacer-color-indice',
        colorProp ?? config.colors.indice,
      ),
      ...getStyleOverride(
        '--bk-spacer-color-line',
        colorProp ?? config.colors.line,
      ),
      ...getStyleOverride(
        '--bk-spacer-color-flat',
        colorProp ?? config.colors.flat,
      ),
    } as React.CSSProperties

    return mergeStyles(customStyles, style)
  }, [getStyleOverride, normHeight, normWidth, config.base, colorProp,
    config.colors.indice, config.colors.line, config.colors.flat, style])

  return (
    <div
      ref={ref}
      className={mergeClasses(styles.spacer, isShown && styles[variant], className)}
      data-testid="spacer"
      data-variant={variant}
      style={containerStyles}
      {...props}
    >
      {measurements}
    </div>
  )
})