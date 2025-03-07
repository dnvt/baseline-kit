import * as React from 'react'
import type { Gaps } from '@components'
import { useConfig, useDebug, useBaseline } from '@hooks'
import {
  mergeStyles,
  mergeClasses,
  parsePadding,
  formatValue,
  createStyleOverride,
  hydratedValue
} from '@utils'
import { Config } from '../Config'
import { Padder } from '../Padder'
import { Spacer } from '../Spacer'
import { ComponentsProps, Variant } from '../types'
import styles from './styles.module.css'

// Import the IndicatorNode type from Spacer props
type IndicatorNode = NonNullable<React.ComponentProps<typeof Spacer>['indicatorNode']>

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
  /** Flag to enable SSR-compatible mode (simplified initial render) */
  ssrMode?: boolean
  /** Container width (defaults to "auto") */
  width?: React.CSSProperties['width']
  /** Container height (defaults to "auto") */
  height?: React.CSSProperties['height']
  children?: React.ReactNode
} & ComponentsProps & Gaps

// Utils -----------------------------------------------------------------------

/** Creates default layout styles with theme colors */
export const createDefaultLayoutStyles = (colors: {
  line: string;
  flat: string;
  text: string;
}): Record<string, string> => ({
  '--bklw': 'auto',
  '--bklh': 'auto',
  '--bklcl': colors.line,
  '--bklcf': colors.flat,
  '--bklci': colors.text,
})

/** Parses grid template definitions into CSS grid-template values. */
export const getGridTemplate = (prop?: number | string | Array<number | string>): string => {
  if (typeof prop === 'number') return `repeat(${prop}, 1fr)`
  if (typeof prop === 'string') return prop
  if (Array.isArray(prop)) {
    return prop.map((p) => (typeof p === 'number' ? `${p}px` : p)).join(' ')
  }
  return 'repeat(auto-fit, minmax(100px, 1fr))'
}

/** Creates grid gap styles */
export const createGridGapStyles = (
  gap?: React.CSSProperties['gap'] | number,
  rowGap?: React.CSSProperties['rowGap'] | number,
  columnGap?: React.CSSProperties['columnGap'] | number,
): Record<string, string> => {
  const styles: Record<string, string> = {}

  if (gap !== undefined) {
    styles.gap = formatValue(gap)
  }
  if (rowGap !== undefined) {
    styles.rowGap = formatValue(rowGap)
  }
  if (columnGap !== undefined) {
    styles.columnGap = formatValue(columnGap)
  }

  return styles
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
  alignContent,
  alignItems,
  children,
  className,
  columns = 'repeat(auto-fit, minmax(100px, 1fr))',
  columnGap,
  debugging: debuggingProp,
  gap,
  height,
  indicatorNode,
  justifyContent,
  justifyItems,
  rowGap,
  rows,
  style,
  variant,
  width,
  ssrMode = false,
  ...spacingProps
}: LayoutProps) {
  const config = useConfig('layout')
  const { isShown, debugging } = useDebug(debuggingProp, config.debugging)
  
  // Add hydration state tracking
  const [isHydrated, setIsHydrated] = React.useState(false)
  
  React.useEffect(() => {
    setIsHydrated(true)
  }, [])
  
  const layoutRef = React.useRef<HTMLDivElement>(null)

  const initialPadding = React.useMemo(
    () => parsePadding(spacingProps),
    [spacingProps],
  )
  
  // Get padding calculation from useBaseline
  const baselinePadding = useBaseline(layoutRef, {
    base: config.base,
    snapping: 'height',
    spacing: initialPadding,
    warnOnMisalignment: true,
  })
  
  // Create stable initial padding for SSR
  const stablePadding = {
    padding: {
      top: initialPadding.top || 0,
      right: initialPadding.right || 0,
      bottom: initialPadding.bottom || 0,
      left: initialPadding.left || 0
    }
  }
  
  // Use stable padding during SSR and initial render, then switch to dynamic padding
  const { padding } = hydratedValue(
    isHydrated && !ssrMode,
    stablePadding,
    baselinePadding
  )

  const gridTemplateColumns = React.useMemo(
    () => getGridTemplate(columns),
    [columns],
  )

  const gridTemplateRows = React.useMemo(
    () => (rows ? getGridTemplate(rows) : 'auto'),
    [rows],
  )

  const defaultLayoutStyles = React.useMemo(
    () => createDefaultLayoutStyles(config.colors),
    [config.colors],
  )

  const gridGapStyles = React.useMemo(
    () => createGridGapStyles(gap, rowGap, columnGap),
    [gap, rowGap, columnGap],
  )

  const containerStyles = React.useMemo(() => {
    const widthValue = formatValue(width || 'auto')
    const heightValue = formatValue(height || 'auto')

    // Define dimensions that should be skipped when set to auto
    const autoDimensions = ['--bklw', '--bklh']

    return mergeStyles(
      {
        // Theme overrides
        ...createStyleOverride({
          key: '--bklw',
          value: widthValue,
          defaultStyles: defaultLayoutStyles,
          skipDimensions: { auto: autoDimensions }
        }),
        ...createStyleOverride({
          key: '--bklh',
          value: heightValue,
          defaultStyles: defaultLayoutStyles,
          skipDimensions: { auto: autoDimensions }
        }),
        ...createStyleOverride({
          key: '--bklcl',
          value: config.colors.line,
          defaultStyles: defaultLayoutStyles
        }),
        ...createStyleOverride({
          key: '--bklcf',
          value: config.colors.flat,
          defaultStyles: defaultLayoutStyles
        }),
        ...createStyleOverride({
          key: '--bklci',
          value: config.colors.text,
          defaultStyles: defaultLayoutStyles
        }),

        // Grid properties - only inject if different from defaults
        ...(gridTemplateColumns !== 'repeat(auto-fit, minmax(100px, 1fr))' && { '--bklgtc': gridTemplateColumns }),
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
    config.colors,
    defaultLayoutStyles,
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
        {... (indicatorNode ? { indicatorNode } : {})}
        inline={[padding.left, padding.right]}
        debugging={debugging}
        width={width}
        height={height}
        ssrMode={ssrMode}
      >
        <div
          data-testid="layout"
          className={mergeClasses(className, styles.lay)}
          style={containerStyles}
          {...(spacingProps && Object.keys(spacingProps).length > 0 ? 
            Object.fromEntries(
              Object.entries(spacingProps).filter(([key]) => key !== 'ssrMode')
            ) : {})}
        >
          {children}
        </div>
      </Padder>
    </Config>
  )
})
