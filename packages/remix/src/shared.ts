import {
  clientEntry,
  ref,
  type Handle,
  type Props,
  type RemixNode,
  type SerializableProps,
} from 'remix/ui'
import { jsx } from 'remix/ui/jsx-runtime'
import { DEFAULT_CONFIG } from '@baseline-kit/core'
import { Config } from './Config'
import {
  createMeasureObserver,
  createVirtualTracker,
  type MeasureRect,
  type VirtualRange,
  type VirtualTrackerHandle,
} from '@baseline-kit/dom'
import type {
  ConfigSchema,
  DebuggingMode,
  SpacingProps,
} from '@baseline-kit/core'

export type NativeStyle = Props<'div'>['style']

export type NativeComponentProps = SpacingProps & {
  className?: string
  style?: NativeStyle
  width?: number | string
  height?: number | string
  debugging?: DebuggingMode
  children?: RemixNode
}

export function classNames(
  ...tokens: Array<string | false | null | undefined>
) {
  return tokens.filter(Boolean).join(' ')
}

export function mergeStyles(
  ...styles: Array<NativeStyle | undefined>
): NativeStyle {
  const result: Record<string, string | number | null | undefined> = {}

  for (const style of styles) {
    if (!style) continue
    if (typeof style === 'string') {
      result.cssText = style
      continue
    }
    Object.assign(result, style)
  }

  return result
}

export function getConfig(
  handle: Handle<unknown, unknown>,
  provider: (...args: never[]) => unknown,
  fallback: ConfigSchema
): ConfigSchema {
  return (
    (handle.context.get(provider) as unknown as ConfigSchema | undefined) ??
    fallback
  )
}

export function resolveDebugging(
  prop: DebuggingMode | undefined,
  configured: DebuggingMode
) {
  const effective = prop ?? configured
  return {
    isShown: effective === 'visible',
    isNone: effective === 'none',
    debugging: effective,
  }
}

export interface ElementObserverBridge {
  attach: ReturnType<typeof ref>
  getElement: () => Element | null
}

export type RuntimeHandle = Pick<Handle, 'signal'>

export type NativeComponent<Props> = (handle: Handle<Props>) => () => RemixNode

/** Capture provider context before Remix serializes an independent entry.
 * The public wrapper also works when an app component creates the consumer
 * during SSR, where walking Config's authored children cannot reach it.
 */
export function configuredClientEntry<P extends object>(
  entryId: string,
  implementation: NativeComponent<P & { __baselineConfig?: ConfigSchema }>
): NativeComponent<P> {
  const Entry = clientEntry(
    entryId,
    implementation as unknown as NativeComponent<SerializableProps>
  )
  const Consumer = ((handle: Handle<P & { __baselineConfig?: ConfigSchema }>) =>
    () => {
      const inheritedConfig = handle.context.get(Config) as
        ConfigSchema | undefined
      const config =
        handle.props.__baselineConfig ??
        // A client entry may hydrate before its authored Config ancestor. The
        // serialized snapshot is the nearest scoped value for that independent
        // boundary; only fall back to live ancestry when no snapshot exists.
        inheritedConfig ??
        DEFAULT_CONFIG
      return jsx(Entry, { ...handle.props, __baselineConfig: config })
    }) as NativeComponent<P>
  return Consumer
}

/**
 * Connects the framework-native `ref` mixin to the shared DOM measurement
 * service. The component runtime owns the lifetime signal, so no React
 * effect or client-only bridge is needed.
 */
export function createElementObserverBridge(
  onMeasure: (rect: MeasureRect) => void
): ElementObserverBridge {
  let element: Element | null = null
  let measureHandle: ReturnType<typeof createMeasureObserver> | undefined
  let hasNonZeroMeasurement = false
  let initialRefreshAttempts = 0

  const refreshUntilMeasured = (signal: AbortSignal) => {
    if (
      signal.aborted ||
      hasNonZeroMeasurement ||
      initialRefreshAttempts >= 10
    ) {
      return
    }

    initialRefreshAttempts += 1
    measureHandle?.refresh()
    requestAnimationFrame(() => refreshUntilMeasured(signal))
  }

  const attach = ref((node, signal) => {
    element = node

    if (typeof ResizeObserver !== 'undefined') {
      measureHandle = createMeasureObserver(node, (rect) => {
        hasNonZeroMeasurement = rect.width > 0 || rect.height > 0
        // The initial measurement can run from the ref insert callback before
        // Remix has committed the component. Deliver it on the next frame so
        // the consumer can safely request an update.
        const deliver = () => {
          if (!signal.aborted) onMeasure(rect)
        }
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(deliver)
        } else {
          queueMicrotask(deliver)
        }
      })

      // A native client entry can hydrate descendants after this ref is
      // inserted. Re-measure on the next frame so an initial zero-sized host
      // does not permanently prevent content-driven sizing from settling.
      queueMicrotask(() => {
        if (signal.aborted) return
        measureHandle?.refresh()
        requestAnimationFrame(() => refreshUntilMeasured(signal))
      })
    }

    signal.addEventListener(
      'abort',
      () => {
        measureHandle?.disconnect()
        measureHandle = undefined
        hasNonZeroMeasurement = false
        initialRefreshAttempts = 0
        element = null
      },
      { once: true }
    )
  })

  return { attach, getElement: () => element }
}

export interface VirtualBridge {
  setConfig: (totalItems: number, itemHeight: number) => void
  getRange: (totalItems: number) => VirtualRange
  dispose: () => void
}

/**
 * Reuses the DOM virtual range tracker from the React adapter. Configuration
 * is refreshed after a component commit and all listeners are torn down with
 * the component's Remix handle signal.
 */
export function createVirtualBridge(
  handle: RuntimeHandle,
  getElement: () => Element | null,
  onRange: (range: VirtualRange) => void,
  buffer = 160
): VirtualBridge {
  let tracker: VirtualTrackerHandle | undefined
  let currentKey = ''
  let configuredTotalItems = 0
  let range: VirtualRange = { start: 0, end: 0 }

  const dispose = () => {
    tracker?.disconnect()
    tracker = undefined
    currentKey = ''
  }

  const setConfig = (totalItems: number, itemHeight: number) => {
    const element = getElement()
    if (!element || typeof IntersectionObserver === 'undefined') return

    const key = `${totalItems}:${itemHeight}:${buffer}`
    if (key === currentKey) return

    dispose()
    currentKey = key
    configuredTotalItems = totalItems
    range = { start: 0, end: totalItems }
    onRange(range)

    tracker = createVirtualTracker(
      element,
      { totalItems, itemHeight, buffer },
      (next) => {
        range = next
        onRange(next)
      }
    )
  }

  handle.signal.addEventListener('abort', dispose, { once: true })

  return {
    setConfig,
    getRange(totalItems) {
      return {
        start: Math.min(Math.max(range.start, 0), totalItems),
        // A measurement update can increase the descriptor's total before
        // the queued tracker reconfiguration runs. Render the complete new
        // range for that one commit so the old one-item fallback is not
        // retained.
        end: Math.min(
          Math.max(
            totalItems !== configuredTotalItems
              ? totalItems
              : range.end || totalItems,
            0
          ),
          totalItems
        ),
      }
    },
    dispose,
  }
}
