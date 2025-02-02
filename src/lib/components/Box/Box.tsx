import { CSSProperties, memo, ReactNode, useMemo, useRef } from 'react'
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
  /** Defines how the box snaps spacing to the base grid: */
  snapping?: SnappingMode;
  children?: ReactNode
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
export const Box = memo(function Box({
  children,
  snapping = 'clamp',
  debugging,
  className,
  width,
  height,
  style,
  ...spacingProps
}: BoxProps) {
  const config = useConfig('box')
  const { isShown } = useDebug(debugging, config.debugging)

  const boxRef = useRef<HTMLDivElement | null>(null)
  const { top, bottom, left, right } = parsePadding(spacingProps)
  const { padding } = useBaseline(boxRef, {
    base: config.base,
    snapping,
    spacing: { top, bottom, left, right },
    warnOnMisalignment: debugging !== 'none',
  })

  // Merging styles
  const boxStyles = useMemo(
    () => cs({
      '--pdd-box-width': width,
      '--pdd-box-height': height,
      '--pdd-box-base': `${config.base}px`,
      '--pdd-box-color-line': config.colors.line,
    } as CSSProperties,
    style,
    ),
    [config.base, config.colors.line, height, style, width],
  )

  return (
    <Config
      base={1}
      spacer={{
        variant: 'flat',
        colors: {
          flat: 'var(--pdd-box-color-flat-theme)',
          line: 'var(--pdd-box-color-line-theme)',
          indice: 'var(--pdd-box-color-indice-theme)',
        },
      }}
    >
      <div
        ref={boxRef}
        className={cx(styles.box, isShown && styles.visible, className)}
        data-testid="box"
        style={boxStyles}
      >
        <Padder
          block={[padding.top, padding.bottom]}
          inline={[padding.left, padding.right]}
          debugging={debugging}
          width={width}
          height={height}
        >
          {children}
        </Padder>
      </div>
    </Config>
  )
})