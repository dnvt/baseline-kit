/** @jsxImportSource remix/ui */

import { type Handle, type RemixNode } from 'remix/ui'
import {
  DEFAULT_CONFIG,
  canCompactFixedGuide,
  calculateGuideTemplate,
  createGuideConfig,
  createGuideDescriptor,
  type GuideVariant,
  type GuideColumnValue,
  type ConfigSchema,
} from '@baseline-kit/core'
import { Config } from './Config'
import { configuredClientEntry } from './shared'
import {
  classNames,
  compactStyle,
  getDOMAttributes,
  createElementObserverBridge,
  getConfig,
  mergeStyles,
  normalizeConfigSnapshot,
  queueNativeUpdate,
  resolveDebugging,
  type NativeComponent,
  type NativeDOMAttributes,
} from './shared'

export type GuideProps = NativeDOMAttributes & {
  align?: string
  variant?: GuideVariant
  columns?: number | readonly GuideColumnValue[]
  columnWidth?: number | string
  maxWidth?: number | string
  color?: string
  gap?: number
  width?: number | string
  height?: number | string
  debugging?: 'none' | 'hidden' | 'visible'
  className?: string
  style?: Record<string, string | number | null | undefined>
  children?: RemixNode
  ssrMode?: boolean
}

type RuntimeGuideProps = GuideProps & {
  __baselineConfig?: ConfigSchema
}

function GuideImpl(handle: Handle<RuntimeGuideProps>) {
  let dimensions = { width: 0, height: 0 }
  const requestUpdate = () => {
    queueNativeUpdate(handle)
  }
  const observer = createElementObserverBridge((next) => {
    if (next.width === dimensions.width && next.height === dimensions.height)
      return
    dimensions = next
    requestUpdate()
  })

  return () => {
    const props = handle.props
    const config = normalizeConfigSnapshot(
      props.__baselineConfig ?? getConfig(handle, Config, DEFAULT_CONFIG)
    )
    const variant = props.variant ?? config.guide.variant
    const debug = resolveDebugging(props.debugging, config.guide.debugging)
    const guideConfig = createGuideConfig({
      variant,
      base: config.base,
      gap: props.gap ?? 0,
      columns: props.columns,
      columnWidth: props.columnWidth,
    })
    const result = calculateGuideTemplate(dimensions.width, guideConfig, {
      viewportWidth:
        typeof window === 'undefined' ? undefined : window.innerWidth,
      viewportHeight:
        typeof window === 'undefined' ? undefined : window.innerHeight,
    })
    const descriptor = createGuideDescriptor({
      base: config.base,
      colors: config.guide.colors,
      variant,
      align: props.align ?? 'center',
      width: props.width,
      height: props.height,
      columnWidth: props.columnWidth,
      maxWidth: props.maxWidth,
      color: props.color,
      template: result.template,
      columnsCount: result.columnsCount,
      calculatedGap: result.calculatedGap,
      isVisible: debug.isShown,
    })
    const compactFixedGuide = canCompactFixedGuide({
      variant,
      columns: props.columns,
      columnWidth: props.columnWidth,
      gap: props.gap ?? 0,
      align: props.align ?? 'center',
      domDiagnostics: config.domDiagnostics,
      className: props.className,
      style:
        props.style && typeof props.style === 'object'
          ? props.style
          : undefined,
    })

    if (props.ssrMode) {
      return (
        <div
          className={classNames(
            'bk-gde',
            'bk-h',
            'bk-ssr',
            `bk-${variant}`,
            props.className
          )}
          data-testid={config.domDiagnostics ? 'guide' : undefined}
          data-variant={config.domDiagnostics ? variant : undefined}
          aria-hidden={true}
          style={mergeStyles(
            compactStyle(
              {
                width: String(props.width ?? '100%'),
                height: String(props.height ?? '100%'),
                maxWidth: String(props.maxWidth ?? 'none'),
              },
              { width: '100%', height: '100%', maxWidth: 'none' }
            ),
            props.style
          )}
          {...getDOMAttributes(props)}
        >
          {props.children}
        </div>
      )
    }

    const columns =
      !descriptor.isLineVariant && debug.isShown && !compactFixedGuide
        ? Array.from({ length: descriptor.columnsCount }, (_, index) => (
            <div
              key={index}
              className={classNames('bk-col', `bk-${variant}`)}
              data-column-index={config.domDiagnostics ? index : undefined}
              data-variant={config.domDiagnostics ? variant : undefined}
            />
          ))
        : null
    const overlay = debug.isShown ? (
      <div
        className={classNames(
          'bk-cols',
          `bk-${variant}`,
          compactFixedGuide && 'bk-cols-compact-fixed'
        )}
        data-variant={config.domDiagnostics ? variant : undefined}
      >
        {columns}
      </div>
    ) : null

    // Runtime mixins contain callbacks and must not be serialized into a
    // parent client entry's props during SSR. The client entry recreates
    // the descriptor while hydrating.
    return (
      <div
        className={classNames(
          ...descriptor.classTokens.map((token) => `bk-${token}`),
          !descriptor.classTokens.includes(variant) && `bk-${variant}`,
          props.className
        )}
        data-testid={config.domDiagnostics ? 'guide' : undefined}
        data-variant={config.domDiagnostics ? variant : undefined}
        aria-hidden={true}
        style={mergeStyles(
          compactStyle(descriptor.containerStyle, {
            '--bkgd-w': '100%',
            '--bkgd-h': '100%',
            '--bkgd-mw': 'none',
            '--bkgd-cw': '60px',
            '--bkgd-n': '12',
            '--bkgd-b': '0',
            '--bkgd-cl': DEFAULT_CONFIG.guide.colors.line,
            '--bkgd-cp': DEFAULT_CONFIG.guide.colors.pattern,
            '--bkgd-ca': DEFAULT_CONFIG.guide.colors.auto,
            '--bkgd-cf': DEFAULT_CONFIG.guide.colors.fixed,
            '--bkgd-g': '0px',
            '--bkgd-j': 'center',
            '--bkgd-t': 'none',
            '--bkgd-line-color': 'var(--bkgd-cl)',
          }),
          props.style
        )}
        {...getDOMAttributes(props)}
        mix={
          typeof window === 'undefined' || props.ssrMode
            ? undefined
            : observer.attach
        }
      >
        {overlay}
        {props.children}
      </div>
    )
  }
}

export const Guide: NativeComponent<GuideProps> =
  configuredClientEntry<GuideProps>(
    `${import.meta.url}#Guide`,
    GuideImpl
  ) as unknown as NativeComponent<GuideProps>
