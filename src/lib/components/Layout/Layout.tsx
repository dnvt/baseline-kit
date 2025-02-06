import * as React from 'react'
import { IndicatorNode } from '@components'
import { useConfig, useDebug, useBaseline } from '@hooks'
import { mergeStyles, mergeClasses, parsePadding } from '@utils'
import { ComponentsProps } from '../types'
import { Padder } from '../Padder'
import styles from './styles.module.css'

export type LayoutProps = {
  /**
   * Grid column definition. Can be:
   * - Number: Equal columns (3 → `repeat(3, 1fr)`)
   * - String: Raw template (`"1fr auto 200px"`)
   * - Array: Mix of numbers/strings ([100, '1fr'] → `"100px 1fr"`)
   */
  columns?: number | string | Array<number | string>;

  /**
   * Grid row definition. Same format as columns.
   * @default: 'auto';
   */
  rows?: number | string | Array<number | string>;
  /** Vertical gap between rows (overrides gap) */
  rowGap?: number | string;
  /** Horizontal gap between columns (overrides gap) */
  columnGap?: number | string;
  /** When provided, it overrides rowGap and columnGap */
  gap?: number | string;
  /** Function that renders a custom indicator (e.g., a label) showing the spacer's measured dimensions */
  indicatorNode?: IndicatorNode
  /** Item alignment along row axis (default: 'stretch') */
  justifyItems?: React.CSSProperties['justifyItems'];
  /** Item alignment along column axis (default: 'stretch') */
  alignItems?: React.CSSProperties['alignItems'];
  /** Content distribution along row axis */
  justifyContent?: React.CSSProperties['justifyContent'];
  /** Content distribution along column axis */
  alignContent?: React.CSSProperties['alignContent'];
  children?: React.ReactNode;
} & ComponentsProps;

function getGridTemplate(prop?: number | string | Array<number | string>) {
  if (typeof prop === 'number') return `repeat(${prop}, 1fr)`
  if (typeof prop === 'string') return prop
  if (Array.isArray(prop)) {
    return prop.map(p => (typeof p === 'number' ? `${p}px` : p)).join(' ')
  }
  // Default value if prop is undefined.
  return 'repeat(auto-fit, minmax(100px, 1fr))'
}

export function Layout({
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

  const gridGapStyles = React.useMemo(() => {
    const gapStyles: React.CSSProperties = {}
    if (gap !== undefined) {
      gapStyles.gap = gap
    }
    return gapStyles
  }, [gap])

  const gridStyles = React.useMemo(() => {
    return mergeStyles({
      display: 'grid',
      gridTemplateColumns,
      gridTemplateRows,
      rowGap,
      columnGap,
      justifyItems,
      alignItems,
      justifyContent,
      alignContent,
      width,
      height,
      '--bk-layout-color-line': config.colors.line,
      '--bk-layout-debug-outline': isShown
        ? '1px solid var(--bk-layout-color-line)'
        : 'none',
    } as React.CSSProperties,
    style,
    )
  }, [gridTemplateColumns, gridTemplateRows, rowGap, columnGap, justifyItems, alignItems, justifyContent, alignContent, width, height, config.colors.line, isShown, style])

  return (
    <Padder
      ref={layoutRef}
      data-testid="layout"
      block={[padding.top, padding.bottom]}
      indicatorNode={indicatorNode}
      inline={[padding.left, padding.right]}
      debugging={debugging}
      width={width}
      height={height}
    >
      <div
        className={mergeClasses(styles.layout, className, isShown && 'visible')}
        style={mergeStyles(gridStyles, gridGapStyles)}
      >
        {children}
      </div>
    </Padder>
  )
}