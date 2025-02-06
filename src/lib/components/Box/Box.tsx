import * as React from 'react'
import { useConfig, useDebug, useBaseline } from '@hooks'
import { cx, cs, parsePadding } from '@utils'
import { Config } from '../Config'
import { Padder } from '../Padder'
import { ComponentsProps } from '../types'
import styles from './styles.module.css'

/**
 * Determines how the component snaps its layout to the base spacing unit.
 *
 * - **"none"**: No snapping; the component uses raw spacing values as provided.
 * - **"height"**: Only the container's height is snapped to the nearest multiple of the base unit (often adjusted by padding-bottom).
 * - **"clamp"**: Both container height **and** any spacing/padding props are snapped to the nearest multiple of the base unit.
 */
export type SnappingMode = 'none' | 'height' | 'clamp';

type BoxProps = {
  /** Sets the number of columns to span in a grid layout */
  colSpan?: number;
  /** Sets the number of rows to span in a grid layout */
  rowSpan?: number;
  /** If using a single span prop, it applies to both columns and rows. When provided, colSpan and rowSpan will be ignored. */
  span?: number;
  /** Defines how the box snaps spacing to the base grid: */
  snapping?: SnappingMode;
  children?: React.ReactNode
} & ComponentsProps

/**
 * Box - A fundamental container that ensures consistent spacing
 * in alignment with the base grid unit. By default, it clamps
 * any spacing (block/inline) to multiples of the configured base.
 *
 * @remarks
 * - **Debugging**: You can toggle debug modes to visualize
 *   or hide underlying spacing elements for development.
 * - **Snapping**: You can toggle snapping modes to ensure your
 *   box's spacing conforms to the baseline unit.
 * - **Integration**: Internally uses <Padder> to apply spacing,
 *   and ties into your global config for base units and colors.
 *
 * @example
 * ```tsx
 * <Box block={16} inline={8} snapping="clamp" debugging="visible">
 *   <p>Content aligned to the baseline grid!</p>
 * </Box>
 * ```
 */
export const Box = React.memo(function Box({
  children,
  snapping = 'clamp',
  debugging: debuggingProp,
  className,
  colSpan,
  rowSpan,
  span,
  width,
  height,
  style,
  ...spacingProps
}: BoxProps) {
  const config = useConfig('box')
  const { isShown, debugging } = useDebug(debuggingProp, config.debugging)

  const boxRef = React.useRef<HTMLDivElement | null>(null)
  const { top, bottom, left, right } = parsePadding(spacingProps)
  const { padding } = useBaseline(boxRef, {
    base: config.base,
    snapping,
    spacing: { top, bottom, left, right },
    warnOnMisalignment: debugging !== 'none',
  })

  const gridSpanStyles = React.useMemo(() => {
    const gridStyles: React.CSSProperties = {}
    if (span !== undefined) {
      gridStyles.gridColumn = `span ${span}`
      gridStyles.gridRow = `span ${span}`
    } else {
      if (colSpan !== undefined) {
        gridStyles.gridColumn = `span ${colSpan}`
      }
      if (rowSpan !== undefined) {
        gridStyles.gridRow = `span ${rowSpan}`
      }
    }
    return gridStyles
  }, [colSpan, rowSpan, span])

  // Merging styles
  const boxStyles = React.useMemo(
    () => cs({
      '--bk-box-width': width,
      '--bk-box-height': height,
      '--bk-box-base': `${config.base}px`,
      '--bk-box-color-line': config.colors.line,
    } as React.CSSProperties, style),
    [config.base, config.colors.line, height, style, width],
  )

  return (
    <div
      ref={boxRef}
      data-testid="box"
      className={cx(styles.box, isShown && styles.visible, className)}
      style={cs(boxStyles, gridSpanStyles)}
    >
      <Config
        base={1}
        spacer={{
          variant: 'flat',
          colors: {
            flat: 'var(--bk-box-color-flat-theme)',
            line: 'var(--bk-box-color-line-theme)',
            indice: 'var(--bk-box-color-indice-theme)',
          },
        }}
      >
        <Padder
          block={[padding.top, padding.bottom]}
          inline={[padding.left, padding.right]}
          width={width}
          height={height}
          debugging={debugging}
        >
          {children}
        </Padder>
      </Config>
    </div>
  )
})