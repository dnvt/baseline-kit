import * as React from 'react'
import { useConfig, useDebug, useBaseline } from '@hooks'
import {
  mergeClasses,
  mergeStyles,
  parsePadding,
  mergeRefs,
  formatValue,
} from '@utils'
import { ComponentsProps, Variant } from '../types'
import { Spacer, IndicatorNode } from '../Spacer'
import { DebuggingMode } from '@/components'
import styles from './styles.module.css'

type RenderSpacerFn = (
  width: React.CSSProperties['width'],
  height: React.CSSProperties['height'],
) => React.ReactNode

type PaddingStyles = {
  paddingBlock?: string;
  paddingInline?: string;
  [key: string]: string | undefined;
}

type PadderProps = {
  /** Render function for custom measurement indicators */
  indicatorNode?: IndicatorNode
  children?: React.ReactNode
} & ComponentsProps

// Utils -----------------------------------------------------------------------

/** Creates default container styles for Padder */
export const createPadderContainerStyles = (
  width: React.CSSProperties['width'],
  height: React.CSSProperties['height'],
  base: number,
  color: string,
): Record<string, string> => {
  const stylesObj: Record<string, string> = {}

  // Only inject width/height if they differ from defaults
  if (width !== 'fit-content') {
    stylesObj['--bkpw'] = formatValue(width || 'fit-content')
  }
  if (height !== 'fit-content') {
    stylesObj['--bkph'] = formatValue(height || 'fit-content')
  }
  // Only inject base if it differs from theme
  if (base !== 8) {
    stylesObj['--bkpb'] = `${base}px`
  }
  // Only inject color if it differs from theme
  if (color !== 'var(--bk-padder-color-theme)') {
    stylesObj['--bkpc'] = color
  }

  return stylesObj
}

/** Creates padding styles when spacers are disabled */
export const createDirectPaddingStyles = (
  enableSpacers: boolean,
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  },
): PaddingStyles => {
  const { top, right, bottom, left } = padding
  const stylesObj: PaddingStyles = {}

  // When spacers are disabled (i.e. debugging === "none"), add direct padding styles
  if (!enableSpacers) {
    if (top > 0 || bottom > 0) {
      stylesObj.paddingBlock = `${top}px ${bottom}px`
    }
    if (left > 0 || right > 0) {
      stylesObj.paddingInline = `${left}px ${right}px`
    }
  }

  return stylesObj
}

/** Creates a render function for spacers */
export const createRenderSpacerFn = (
  variant: Variant | undefined,
  debugging: DebuggingMode | undefined,
  indicatorNode?: IndicatorNode,
): RenderSpacerFn => {
  // Default to 'line' if variant is undefined
  const safeVariant = variant || 'line'
  // Default to 'none' if debugging is undefined
  const safeDebugging = debugging || 'none'

  const SpacerElement = (widthVal: React.CSSProperties['width'], heightVal: React.CSSProperties['height']) => (
    <Spacer
      variant={safeVariant}
      debugging={(heightVal === 0 || widthVal === 0) ? 'none' : safeDebugging}
      indicatorNode={indicatorNode}
      height={heightVal !== '100%' ? heightVal : undefined}
      width={widthVal !== '100%' ? widthVal : undefined}
    />
  )

  // Add display name to satisfy linter
  SpacerElement.displayName = 'PadderSpacer'

  return SpacerElement
}

/**
 * A foundational component that manages consistent padding with visual debugging.
 *
 * @remarks
 * Padder is a low-level utility that:
 * - Applies consistent padding around content
 * - Supports visual debugging of spacing
 * - Maintains baseline grid alignment
 * - Uses Spacer components for visual padding representation
 *
 * When debugging is enabled (`"visible"` or `"hidden"`), padding is represented
 * using Spacer components. When debugging is `"none"`, direct CSS padding is
 * applied for better performance.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Padder block={16} inline={8}>
 *   <div>Content with consistent padding</div>
 * </Padder>
 *
 * // With debug visuals and custom indicators
 * <Padder
 *   block={[8, 16]}
 *   inline={[16, 24]}
 *   debugging="visible"
 *   indicatorNode={(value, dim) => (
 *     <span className="text-sm">{dim}: {value}px</span>
 *   )}
 * >
 *   <div>Content with visible padding guides</div>
 * </Padder>
 *
 * // Direct padding mode
 * <Padder
 *   block={16}
 *   inline={24}
 *   debugging="none"
 * >
 *   <div>Content with direct CSS padding</div>
 * </Padder>
 * ```
 */
export const Padder = React.memo(
  React.forwardRef<HTMLDivElement, PadderProps>(function Padder(
    {
      children,
      className,
      debugging: debuggingProp,
      height,
      indicatorNode,
      style,
      width,
      ...spacingProps
    },
    ref,
  ) {
    const config = useConfig('padder')
    const { variant } = useConfig('spacer')
    const initialPadding = React.useMemo(
      () => parsePadding(spacingProps),
      [spacingProps],
    )
    const { isShown, isNone, debugging } = useDebug(
      debuggingProp,
      config.debugging,
    )
    const enableSpacers = !isNone

    const internalRef = React.useRef<HTMLDivElement | null>(null)
    const {
      padding: { top, left, bottom, right },
    } = useBaseline(internalRef, {
      base: config.base,
      snapping: 'height',
      spacing: initialPadding,
      warnOnMisalignment: !isNone,
    })

    const setRefs = mergeRefs(ref, internalRef)

    const containerStyles = React.useMemo(() => {
      const baseStyles = createPadderContainerStyles(
        width,
        height,
        config.base,
        config.color,
      )

      const paddingStyles = createDirectPaddingStyles(
        enableSpacers,
        { top, right, bottom, left },
      )

      return mergeStyles(
        { ...baseStyles, ...paddingStyles } as React.CSSProperties,
        style,
      )
    }, [
      width,
      height,
      config.base,
      config.color,
      enableSpacers,
      top,
      right,
      bottom,
      left,
      style,
    ])

    const renderSpacer = React.useMemo(
      () => createRenderSpacerFn(variant, debugging, indicatorNode),
      [variant, debugging, indicatorNode],
    )

    // When debugging is "none", simply return a container with direct CSS padding
    // and no additional grid/Spacer elements.
    if (!enableSpacers) {
      return (
        <div
          ref={setRefs}
          data-testid="padder"
          className={mergeClasses(styles.pad, className)}
          style={containerStyles}
        >
          {children}
        </div>
      )
    }

    // When debugging is enabled, use a grid structure with wrapping spacer elements.
    return (
      <div
        ref={setRefs}
        data-testid="padder"
        className={mergeClasses(styles.pad, isShown && styles.v, className)}
        style={containerStyles}
      >
        <>
          {/* Top spacer - spans full width */}
          {top >= 0 && (
            <div style={{ gridColumn: '1 / -1' }}>
              {renderSpacer('100%', top)}
            </div>
          )}

          {/* Left spacer */}
          {left >= 0 && (
            <div style={{ gridRow: '2 / 3' }}>{renderSpacer(left, '100%')}</div>
          )}
        </>

        {/* Main content - centered in grid */}
        <div style={{ gridRow: '2 / 3', gridColumn: '2 / 3' }}>{children}</div>

        <>
          {/* Right spacer */}
          {right >= 0 && (
            <div style={{ gridRow: '2 / 3' }}>
              {renderSpacer(right, '100%')}
            </div>
          )}

          {/* Bottom spacer - spans full width */}
          {bottom >= 0 && (
            <div style={{ gridColumn: '1 / -1' }}>
              {renderSpacer('100%', bottom)}
            </div>
          )}
        </>
      </div>
    )
  }),
)
