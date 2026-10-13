/** @jsxImportSource remix/component */

import {
  clientEntry,
  ref,
  type Handle,
  type Props,
  type RemixNode,
  type SerializableProps,
} from 'remix/component'
import { DEFAULT_CONFIG } from '@baseline-kit/core'
import { Config } from './Config'
import {
  createMeasureObserver,
  getCSSZoom,
  createVirtualTracker,
  type MeasureRect,
  type VirtualRange,
  type VirtualTrackerHandle,
} from '@baseline-kit/dom'
import type { ConfigSchema } from '@baseline-kit/core'

export type NativeStyle = Props<'div'>['style']

export type NativeDOMAttributes = {
  id?: string
  title?: string
  role?: string
  tabIndex?: number
  lang?: string
  dir?: string
  hidden?: boolean
  [key: `data-${string}`]: string | number | boolean | undefined
  [key: `aria-${string}`]: string | number | boolean | undefined
}

/** Host props every Remix component accepts on top of its core options. */
export type NativeHostProps = NativeDOMAttributes & {
  className?: string
  style?: Record<string, string | number | null | undefined>
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

export function normalizeConfigSnapshot(config: ConfigSchema): ConfigSchema {
  if (typeof config.domDiagnostics === 'boolean') return config
  return { ...config, domDiagnostics: false }
}

export interface ElementObserverBridge {
  attach: ReturnType<typeof ref>
  getElement: () => Element | null
  /** Measure the attached element now and deliver it, even if unchanged. */
  remeasure: () => void
}

export type RuntimeHandle = Pick<Handle, 'signal' | 'update'>

// Remix counts component updates that happen before control returns to the
// event loop. A page with many independent measured components can otherwise
// trip that diagnostic during hydration even when every update is bounded and
// legitimate. Keep the queue below the upstream warning threshold and spread
// larger batches over animation frames; this also gives each batch a chance to
// settle before the next one is reconciled.
const MAX_NATIVE_UPDATES_PER_FRAME = 40
const pendingNativeUpdates = new WeakSet<RuntimeHandle>()
let nativeUpdateQueue: RuntimeHandle[] = []
let nativeUpdateFlushScheduled = false

function flushNativeUpdates() {
  nativeUpdateFlushScheduled = false

  const batch = nativeUpdateQueue.splice(0, MAX_NATIVE_UPDATES_PER_FRAME)
  for (const handle of batch) {
    if (handle.signal.aborted) {
      pendingNativeUpdates.delete(handle)
      continue
    }

    try {
      void handle
        .update()
        .catch(() => undefined)
        .finally(() => pendingNativeUpdates.delete(handle))
    } catch {
      pendingNativeUpdates.delete(handle)
    }
  }

  if (nativeUpdateQueue.length > 0) scheduleNativeUpdateFlush()
}

function scheduleNativeUpdateFlush() {
  if (nativeUpdateFlushScheduled) return
  nativeUpdateFlushScheduled = true

  if (typeof requestAnimationFrame === 'function') {
    // Yield through a timer before requesting the next frame. Remix resets
    // its cascading-update counter with a timer; scheduling the next frame
    // directly can let WebKit run it first and merge two capped batches.
    setTimeout(() => requestAnimationFrame(flushNativeUpdates), 0)
  } else {
    // The extra turn keeps the fallback equally isolated from a scheduler
    // counter reset queued by the preceding update.
    setTimeout(() => setTimeout(flushNativeUpdates, 0), 0)
  }
}

export function queueNativeUpdate(handle: RuntimeHandle) {
  if (handle.signal.aborted || pendingNativeUpdates.has(handle)) return
  pendingNativeUpdates.add(handle)
  nativeUpdateQueue.push(handle)
  scheduleNativeUpdateFlush()
}

export type NativeComponent<Props> = (handle: Handle<Props>) => () => RemixNode

type RuntimeEntryProps = SerializableProps & {
  __baselineConfig?: ConfigSchema
}

/** Capture provider context before Remix serializes an independent entry.
 * The public wrapper also works when an app component creates the consumer
 * during SSR, where walking Config's authored children cannot reach it.
 */
/** Structural equality for plain config snapshots. */
function sameConfigValue(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true
  if (
    typeof left !== 'object' ||
    left === null ||
    typeof right !== 'object' ||
    right === null
  ) {
    return false
  }

  if (Array.isArray(left) || Array.isArray(right)) {
    return (
      Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((value, index) => sameConfigValue(value, right[index]))
    )
  }

  const leftRecord = left as Record<string, unknown>
  const rightRecord = right as Record<string, unknown>
  const leftKeys = Object.keys(leftRecord)
  return (
    leftKeys.length === Object.keys(rightRecord).length &&
    leftKeys.every(
      (key) =>
        Object.prototype.hasOwnProperty.call(rightRecord, key) &&
        sameConfigValue(leftRecord[key], rightRecord[key])
    )
  )
}

export function configuredClientEntry<P extends object>(
  entryId: string,
  implementation: NativeComponent<P & { __baselineConfig?: ConfigSchema }>
): NativeComponent<P> {
  const Entry = clientEntry(
    entryId,
    implementation as unknown as NativeComponent<SerializableProps>
  ) as unknown as NativeComponent<RuntimeEntryProps>
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
      // The default config needs no snapshot: the hydrated entry falls back
      // to it anyway, so skip serializing it into every entry's props.
      return (
        <Entry
          {...(handle.props as unknown as SerializableProps)}
          __baselineConfig={
            sameConfigValue(config, DEFAULT_CONFIG) ? undefined : config
          }
        />
      )
    }) as NativeComponent<P>
  return Consumer
}

interface AttachedBridge {
  element: () => Element | null
  release: () => void
}

/**
 * Bridges whose ref is currently attached. Remix does not dispose every client
 * entry hydrated inside another entry's boundary, so a nested entry's ref
 * signal may never abort. A bridge that detaches therefore also releases the
 * attached bridges whose elements are no longer in the document.
 */
const attachedBridges = new Set<AttachedBridge>()

/**
 * Connects the framework-native `ref` mixin to the shared DOM measurement
 * service. The component runtime owns the lifetime signal, so no React
 * effect or client-only bridge is needed.
 */
export function createElementObserverBridge(
  onMeasure: (rect: MeasureRect, element: Element) => void
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

  const bridge: AttachedBridge = {
    element: () => element,
    release: () => {
      attachedBridges.delete(bridge)
      measureHandle?.disconnect()
      measureHandle = undefined
      hasNonZeroMeasurement = false
      initialRefreshAttempts = 0
      element = null
    },
  }

  const detach = () => {
    const host = element
    bridge.release()
    if (!host) return
    // Remix may never abort the ref signal of an entry nested inside another
    // entry (or rendered into an element that never joins the document), so
    // every detach also releases bridges whose elements are out of the
    // document. Check twice, half a second apart, so an element that is only
    // detached briefly (moved by other code) keeps its observer.
    const releaseRemoved = () => {
      const detached = [...attachedBridges].filter((attached) => {
        const nested = attached.element()
        return nested !== null && !nested.isConnected
      })
      if (detached.length === 0) return
      setTimeout(() => {
        for (const attached of detached) {
          const nested = attached.element()
          if (
            attachedBridges.has(attached) &&
            nested !== null &&
            !nested.isConnected
          ) {
            attached.release()
          }
        }
      }, 500)
    }
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(releaseRemoved)
    } else {
      queueMicrotask(releaseRemoved)
    }
  }

  const attach = ref((node, signal) => {
    element = node
    attachedBridges.add(bridge)

    if (typeof ResizeObserver !== 'undefined') {
      measureHandle = createMeasureObserver(node, (rect) => {
        hasNonZeroMeasurement = rect.width > 0 || rect.height > 0
        // The initial measurement can run from the ref insert callback before
        // Remix has committed the component. Deliver it on the next frame so
        // the consumer can safely request an update.
        const deliver = () => {
          if (!signal.aborted && element === node) onMeasure(rect, node)
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

    signal.addEventListener('abort', detach, { once: true })
  })

  const remeasure = () => {
    if (!element || !element.isConnected) return
    const zoom = getCSSZoom(element)
    const rect = element.getBoundingClientRect()
    onMeasure(
      { width: Math.round(rect.width / zoom), height: rect.height / zoom },
      element
    )
  }

  return { attach, getElement: () => element, remeasure }
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
