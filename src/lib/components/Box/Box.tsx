import { CSSProperties, memo, useMemo } from 'react'
import { Padder } from '@components'
import { cx, cs, normalizePadding } from '@utils'
import type { BoxProps } from './types'
import type { Padding, Spacing } from '@utils'
import styles from './styles.module.css'
import { ConfigContext, useComponentConfig } from '@context'

const normalizeSpacingValue = (value: Spacing, baseUnit: number) => {
  if (typeof value === 'number') {
    return value % (2 * baseUnit)
  }
  if (Array.isArray(value)) {
    return [
      value[0] % (2 * baseUnit),
      value[1] % (2 * baseUnit),
    ]
  }
  return {
    start: value.start % (2 * baseUnit),
    end: value.end % (2 * baseUnit),
  }
}
export const Box = memo(function Box({
  children,
  width = 'fit-content',
  height = 'fit-content',
  visibility = 'none',
  className,
  style,
  inline,
  block,
  ...spacingProps
}: BoxProps) {
  const config = useComponentConfig('box')
  const { color, baseUnit, zIndex } = config

  const spacing = useMemo(() => {
    let normalizedSpacing

    if (inline !== undefined || block !== undefined) {
      normalizedSpacing = {
        inline: inline ? normalizeSpacingValue(inline, baseUnit) : [0, 0],
        block: block ? normalizeSpacingValue(block, baseUnit) : [0, 0],
      }
    } else {
      normalizedSpacing = normalizePadding(spacingProps as Padding)
      return {
        inline: normalizeSpacingValue(normalizedSpacing.inline, baseUnit),
        block: normalizeSpacingValue(normalizedSpacing.block, baseUnit),
      }
    }

    return normalizedSpacing
  }, [inline, block, spacingProps, baseUnit])

  return (
    <ConfigContext value={{
      spacer: { baseUnit: 1, variant: 'flat', colors: { flat: 'var(--box-color-flat)' } },
    }}>
      <Padder
        {...spacing}
        width={width}
        height={height}
        visibility={visibility}
        {...spacingProps}
      >
        <div
          className={cx(styles.box, className)}
          data-testid={spacingProps['data-testid'] ?? 'box'}
          style={cs({
            '--box-width': width,
            '--box-height': height,
            '--box-color': color,
            '--box-base-unit': `${baseUnit}px`,
            '--box-z-index': zIndex,
          } as CSSProperties, style)}
        >
          {children}
        </div>
      </Padder>
    </ConfigContext>
  )
})
