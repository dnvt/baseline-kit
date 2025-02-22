/**
 * @file Layout Component
 * @description Grid-based layout component with baseline alignment
 * @module components
 */

import * as React from 'react'
import type { Gaps, IndicatorNode } from '@components'
import { useConfig, useDebug, useBaseline } from '@hooks'
import { mergeStyles, mergeClasses, parsePadding, formatValue } from '@utils'
import { Config } from '../Config'
import { Padder } from '../Padder'
import { ComponentsProps, Variant } from '../types'
import styles from './styles.module.css'

export type LayoutProps = {
  /**
   * Grid column definition. Supports:
   * - Number: Equal columns (3 → repeat(3, 1fr))
   * - String: Raw template ("1fr auto 200px")
   * - Array: Mixed values ([100, '1fr'] → "100px 1fr")
   */
  columns?: number | string | Array<number | string>
  /** Grid row definition (same format as columns) */
  rows?: number | string | Array<number | string>
  /** Controls item alignment along column axis */
  justifyItems?: React.CSSProperties['justifyItems']
  /** Controls item alignment along row axis */
  alignItems?: React.CSSProperties['alignItems']
  /** Controls content distribution along row axis */
  justifyContent?: React.CSSProperties['justifyContent']
  /** Controls content distribution along column axis */
  alignContent?: React.CSSProperties['alignContent']
  /** Custom measurement indicator renderer */
  indicatorNode?: IndicatorNode
  /** Visual style in debug mode */
  variant?: Variant
  children?: React.ReactNode
} & ComponentsProps &
  Gaps

/** Parses grid template definitions into CSS grid-template values. */
function getGridTemplate(prop?: number | string | Array<number | string>) {
  if (typeof prop === 'number') return `repeat(${prop}, 1fr)`
  if (typeof prop === 'string') return prop
  if (Array.isArray(prop)) {
    return prop.map((p) => (typeof p === 'number' ? `${p}px` : p)).join(' ')
  }
  return 'repeat(auto-fit, minmax(100px, 1fr))'
}

/**
 * A grid-based layout component with baseline alignment and responsive columns.
 *
 * @remarks
 * Layout provides a CSS Grid container that:
 * - Supports flexible column definitions
 * - Maintains baseline grid alignment
 * - Includes gap management
 * - Offers comprehensive alignment controls
 * - Provides debug overlays for visual verification
 *
 * When no explicit dimensions are provided, Layout defaults to "auto"
 * for both width and height.
 *
 * @example
 * ```tsx
 * // Basic equal columns
 * <Layout columns={3} gap={16}>
 *   <div>Column 1</div>
 *   <div>Column 2</div>
 *   <div>Column 3</div>
 * </Layout>
 *
 * // Mixed column widths with alignment
 * <Layout
 *   columns={['200px', '1fr', '2fr']}
 *   gap={24}
 *   alignItems="center"
 *   justifyContent="space-between"
 * >
 *   <div>Fixed</div>
 *   <div>Flexible</div>
 *   <div>Double width</div>
 * </Layout>
 * ```
 */
export const Layout = React.memo(function Layout({
  children,
  columns,
  rows,
  rowGap,
  columnGap,
  gap,
  height,
  width,
  indicatorNode,
  justifyItems,
  alignItems,
  justifyContent,
  alignContent,
  className,
  variant,
  style,
  debugging,
  ...spacingProps
}: LayoutProps) {
  const config = useConfig('layout')
  const { isShown } = useDebug(debugging, config.debugging)
  const layoutRef = React.useRef<HTMLDivElement>(null)

  const initialPadding = React.useMemo(
    () => parsePadding(spacingProps),
    [spacingProps],
  )
  const { padding } = useBaseline(layoutRef, {
    base: config.base,
    snapping: 'height',
    spacing: initialPadding,
    warnOnMisalignment: true,
  })

  const gridTemplateColumns = React.useMemo(
    () => getGridTemplate(columns),
    [columns],
  )

  const gridTemplateRows = React.useMemo(
    () => (rows ? getGridTemplate(rows) : 'auto'),
    [rows],
  )

  const defaultLayoutStyles: Record<string, string> = React.useMemo(
    () => ({
      '--bklw': 'auto',
      '--bklh': 'auto',
      '--bklcl': config.colors.line,
      '--bklcf': config.colors.flat,
      '--bklci': config.colors.text,
    }),
    [config.colors.line, config.colors.flat, config.colors.text],
  )

  const getLayoutStyleOverride = React.useCallback(
    (key: string, value: string): Record<string, string | number> => {
      // For width/height, if value is "auto" skip injection.
      if ((key === '--bklw' || key === '--bklh') && value === 'auto') {
        return {}
      }
      return value !== defaultLayoutStyles[key] ? { [key]: value } : {}
    },
    [defaultLayoutStyles],
  )

  const gridGapStyles = React.useMemo(
    () => ({
      ...(gap !== undefined && { gap: formatValue(gap) }),
      ...(rowGap !== undefined && { rowGap: formatValue(rowGap) }),
      ...(columnGap !== undefined && { columnGap: formatValue(columnGap) }),
    }),
    [gap, rowGap, columnGap],
  )

  const containerStyles = React.useMemo(() => {
    const widthValue = formatValue(width || 'auto')
    const heightValue = formatValue(height || 'auto')

    return mergeStyles(
      {
        // Theme overrides
        ...getLayoutStyleOverride('--bklw', widthValue),
        ...getLayoutStyleOverride('--bklh', heightValue),
        ...getLayoutStyleOverride('--bklcl', config.colors.line),
        ...getLayoutStyleOverride('--bklcf', config.colors.flat),
        ...getLayoutStyleOverride('--bklci', config.colors.text),

        // Grid properties - only inject if different from defaults
        ...(gridTemplateColumns !== 'repeat(auto-fit, minmax(100px, 1fr))' && {
          '--bklgtc': gridTemplateColumns,
        }),
        ...(gridTemplateRows !== 'auto' && { '--bklgtr': gridTemplateRows }),
        ...(justifyItems && { '--bklji': justifyItems }),
        ...(alignItems && { '--bklai': alignItems }),
        ...(justifyContent && { '--bkljc': justifyContent }),
        ...(alignContent && { '--bklac': alignContent }),

        // Include gap styles
        ...gridGapStyles,
      } as React.CSSProperties,
      style,
    )
  }, [
    gridTemplateColumns,
    gridTemplateRows,
    justifyItems,
    alignItems,
    justifyContent,
    alignContent,
    width,
    height,
    config.colors.line,
    config.colors.flat,
    config.colors.text,
    getLayoutStyleOverride,
    style,
    gridGapStyles,
  ])

  return (
    <Config
      spacer={{ variant: variant ?? 'line' }}
    >
      <Padder
        ref={layoutRef}
        className={isShown ? styles.v : ''}
        block={[padding.top, padding.bottom]}
        indicatorNode={indicatorNode}
        inline={[padding.left, padding.right]}
        debugging={debugging}
        width={width}
        height={height}
      >
        <div
          data-testid="layout"
          className={mergeClasses(className, styles.lay)}
          style={containerStyles}
        >
          {children}
        </div>
      </Padder>
    </Config>
  )
})
