/** @jsxImportSource remix/component */

import { type Handle, type RemixNode } from 'remix/component'
import {
  canCompactFixedGuide,
  calculateGuideTemplate,
  createGuideConfig,
  createGuideDescriptor,
  createGuideFallbackStyle,
  type ConfigSchema,
  type GuideOptions,
  cx,
  getDOMAttributes,
  resolveDebugState,
} from '@baseline-kit/core'
import { configuredClientEntry } from './shared'
import {
  createElementObserverBridge,
  createConfigReader,
  mergeStyles,
  queueNativeUpdate,
  type NativeComponent,
  type NativeHostProps,
} from './shared'

export type GuideProps = GuideOptions &
  NativeHostProps & {
    children?: RemixNode
  }

type RuntimeGuideProps = GuideProps & {
  __baselineConfig?: ConfigSchema
}

function GuideImpl(handle: Handle<RuntimeGuideProps>) {
  // Its rows or columns depend on the base: hydrate at the server's.
  const readConfig = createConfigReader(handle, { serverFirst: true })
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
    const config = readConfig()
    const variant = props.variant ?? config.guide.variant
    const debug = resolveDebugState(props.debugging, config.guide.debugging)
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
          className={cx(
            'bk-gde',
            'bk-h',
            'bk-ssr',
            `bk-${variant}`,
            props.className
          )}
          data-testid={config.domDiagnostics ? 'guide' : undefined}
          data-variant={config.domDiagnostics ? variant : undefined}
          aria-hidden="true"
          style={mergeStyles(
            createGuideFallbackStyle(props.width, props.height, props.maxWidth),
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
              className={cx('bk-col', `bk-${variant}`)}
              data-column-index={config.domDiagnostics ? index : undefined}
              data-variant={config.domDiagnostics ? variant : undefined}
            />
          ))
        : null
    const overlay = debug.isShown ? (
      <div
        className={cx(
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
        className={cx(
          ...descriptor.classTokens.map((token) => `bk-${token}`),
          props.className
        )}
        data-testid={config.domDiagnostics ? 'guide' : undefined}
        data-variant={config.domDiagnostics ? variant : undefined}
        aria-hidden="true"
        style={mergeStyles(descriptor.containerStyle, props.style)}
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
