import { type Handle, type RemixNode } from 'remix/ui'
import { jsx } from 'remix/ui/jsx-runtime'
import {
  DEFAULT_CONFIG,
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
  createElementObserverBridge,
  getConfig,
  mergeStyles,
  queueNativeUpdate,
  resolveDebugging,
  type NativeComponent,
} from './shared'

export type GuideProps = {
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
    const config =
      props.__baselineConfig ?? getConfig(handle, Config, DEFAULT_CONFIG)
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

    if (props.ssrMode) {
      return jsx('div', {
        className: classNames('bk-gde', 'bk-h', 'bk-ssr', props.className),
        'data-testid': 'guide',
        'data-variant': variant,
        'aria-hidden': true,
        style: mergeStyles(
          {
            width: props.width ?? '100%',
            height: props.height ?? '100%',
            maxWidth: props.maxWidth ?? 'none',
          },
          props.style
        ),
        children: props.children,
      })
    }

    const columns =
      !descriptor.isLineVariant && debug.isShown
        ? Array.from({ length: descriptor.columnsCount }, (_, index) =>
            jsx('div', {
              key: index,
              className: 'bk-col',
              'data-column-index': index,
              'data-variant': variant,
            })
          )
        : null
    const overlay = debug.isShown
      ? jsx('div', {
          className: 'bk-cols',
          'data-variant': variant,
          children: columns,
        })
      : null

    return jsx('div', {
      className: classNames(
        ...descriptor.classTokens.map((token) => `bk-${token}`),
        props.className
      ),
      'data-testid': 'guide',
      'data-variant': variant,
      'aria-hidden': true,
      style: mergeStyles(descriptor.containerStyle, props.style),
      // Runtime mixins contain callbacks and must not be serialized into a
      // parent client entry's props during SSR. The client entry recreates
      // the descriptor while hydrating.
      mix:
        typeof window === 'undefined' || props.ssrMode
          ? undefined
          : observer.attach,
      children: [overlay, props.children],
    })
  }
}

export const Guide: NativeComponent<GuideProps> =
  configuredClientEntry<GuideProps>(
    `${import.meta.url}#Guide`,
    GuideImpl
  ) as unknown as NativeComponent<GuideProps>
