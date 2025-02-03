import {
  Children,
  cloneElement,
  createContext,
  CSSProperties,
  isValidElement,
  ReactElement,
  ReactNode,
  useContext,
  useMemo,
  useRef,
} from 'react'
import { cs, cx } from '@utils'
import { useConfig, useDebug, useBaseline } from '@hooks'
import { parsePadding } from '@utils'
import { ComponentsProps } from '../types'
import { Config } from '../Config'
import { Padder } from '../Padder'
import styles from './styles.module.css'

export type LayoutContextValue = {
  columnsCount: number;
};

type GridItemProps = {
  colSpan?: number;
  rowSpan?: number;
  style?: CSSProperties;
}

const LayoutContext = createContext<LayoutContextValue | null>(null)

export const useLayoutContext = () => {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error('useLayoutContext must be used within a Layout')
  }
  return context
}

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
  /** Overall gap between grid items (number uses base unit) */
  gap?: number | string;
  /** Vertical gap between rows (overrides gap) */
  rowGap?: number | string;
  /** Horizontal gap between columns (overrides gap) */
  columnGap?: number | string;
  /** Item alignment along row axis (default: 'stretch') */
  justifyItems?: CSSProperties['justifyItems'];
  /** Item alignment along column axis (default: 'stretch') */
  alignItems?: CSSProperties['alignItems'];
  /** Content distribution along row axis */
  justifyContent?: CSSProperties['justifyContent'];
  /** Content distribution along column axis */
  alignContent?: CSSProperties['alignContent'];

  /**
   * Grid content or render prop function receiving:
   * - columnsCount: Current number of columns
   */
  children?: ReactNode | ((context: LayoutContextValue) => ReactNode);
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
  gap,
  rowGap,
  columnGap,
  justifyItems,
  alignItems,
  justifyContent,
  alignContent,
  className,
  style,
  debugging,
  ...props
}: LayoutProps) {
  const config = useConfig('layout')
  const { isShown } = useDebug(debugging, config.debugging)
  const containerRef = useRef<HTMLDivElement>(null)

  // Parse padding using the utility (e.g. from props like block/inline).
  const initialPadding = parsePadding(props)
  const { padding } = useBaseline(containerRef, {
    base: config.base,
    snapping: 'height',
    spacing: initialPadding,
  })

  const gridTemplateColumns = useMemo(
    () => getGridTemplate(columns),
    [columns],
  )

  const gridTemplateRows = useMemo(
    () => (rows ? getGridTemplate(rows) : 'auto'),
    [rows],
  )

  const columnsCount = useMemo(() => {
    if (typeof columns === 'number') return columns
    if (typeof columns === 'string') return columns.split(/\s+/).length
    if (Array.isArray(columns)) return columns.length
    return 0
  }, [columns])

  const contextValue = useMemo<LayoutContextValue>(
    () => ({ columnsCount }),
    [columnsCount],
  )

  const gridStyles = useMemo(() => {
    return cs(
      {
        display: 'grid',
        gridTemplateColumns,
        gridTemplateRows,
        gap,
        rowGap,
        columnGap,
        justifyItems,
        alignItems,
        justifyContent,
        alignContent,
        '--pdd-layout-color-line': config.colors.line,
        '--pdd-layout-debug-outline': isShown
          ? '1px solid var(--pdd-layout-color-line)'
          : 'none',
      } as CSSProperties,
      style,
    )
  }, [
    gridTemplateColumns,
    gridTemplateRows,
    gap,
    rowGap,
    columnGap,
    justifyItems,
    alignItems,
    justifyContent,
    alignContent,
    config.colors.line,
    isShown,
    style,
  ])

  // Process children. If children is a function, call it with the context.
  const content = useMemo(
    () =>
      typeof children === 'function' ? children(contextValue) : children,
    [children, contextValue],
  )

  // Automatically wrap each child with grid item props if provided.
  const wrappedChildren = Children.map(content, child => {
    if (!isValidElement(child)) return child

    // Assert child is a ReactElement so we can destructure its props.
    type ChildProps = GridItemProps & Record<string, unknown>;
    const element = child as ReactElement<ChildProps>

    const { colSpan, rowSpan, style: childStyle, ...rest } = element.props
    const itemStyle = cs(
      {
        gridColumn: colSpan ? `span ${colSpan}` : undefined,
        gridRow: rowSpan ? `span ${rowSpan}` : undefined,
      },
      childStyle,
    )
    return cloneElement(element, { ...rest, style: itemStyle })
  })

  return (
    <Config base={config.base}>
      <LayoutContext value={contextValue}>
        <div
          ref={containerRef}
          className={cx(
            styles.layout,
            className,
            isShown ? 'visible' : 'hidden',
          )}
          style={gridStyles}
          data-testid="layout"
          {...props}
        >
          <Padder
            block={[padding.top, padding.bottom]}
            inline={[padding.left, padding.right]}
            debugging={debugging}
            width="100%"
            height="100%"
          >
            {wrappedChildren}
          </Padder>
        </div>
      </LayoutContext>
    </Config>
  )
}