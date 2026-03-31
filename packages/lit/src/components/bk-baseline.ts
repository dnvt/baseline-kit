import { html, css, nothing } from 'lit'
import { createRef, ref } from 'lit/directives/ref.js'
import { styleMap } from 'lit/directives/style-map.js'
import type { BaselineVariant } from '@baseline-kit/core'
import {
  cx,
  resolveDebugState,
  createBaselineDescriptor,
} from '@baseline-kit/core'
import {
  createMeasureObserver,
  createVirtualTracker,
} from '@baseline-kit/dom'
import type { MeasureObserverHandle, VirtualTrackerHandle } from '@baseline-kit/dom'
import { BkBase } from './bk-base.js'

/**
 * <bk-baseline> — Baseline grid overlay.
 */
export class BkBaseline extends BkBase {
  static override properties = {
    variant: {},
    debugging: {},
    color: {},
    width: {},
    height: {},
    base: { type: Number },
    _containerWidth: { state: true },
    _containerHeight: { state: true },
    _virtualStart: { state: true },
    _virtualEnd: { state: true },
  }

  static override styles = css`
    :host { display: block; }
    .bas {
      position: absolute;
      inset: 0;
      pointer-events: none;
      width: var(--bkbl-w);
      height: var(--bkbl-h);
      overflow: hidden;
    }
    .row {
      left: 0;
      right: 0;
      position: absolute;
      top: var(--bkbl-rt);
      height: var(--bkbl-rh);
      background-color: var(--bkbl-c);
    }
  `

  declare variant: BaselineVariant | undefined
  declare debugging: 'visible' | 'hidden' | 'none' | undefined
  declare color: string | undefined
  declare width: string | number | undefined
  declare height: string | number | undefined
  declare base: number | undefined

  private _containerWidth = 0
  private _containerHeight = 0
  private _virtualStart = 0
  private _virtualEnd = 0

  private _containerRef = createRef<HTMLDivElement>()
  private _measureHandle?: MeasureObserverHandle
  private _virtualHandle?: VirtualTrackerHandle

  override disconnectedCallback() {
    super.disconnectedCallback()
    this._measureHandle?.disconnect()
    this._virtualHandle?.disconnect()
  }

  override updated() {
    const el = this._containerRef.value
    if (!el) return

    if (!this._measureHandle) {
      this._measureHandle = createMeasureObserver(el, (rect) => {
        this._containerWidth = rect.width
        this._containerHeight = rect.height
        this.requestUpdate()
      })
    }

    const cfg = this._config.baseline
    const resolvedBase = this.base ?? this._config.base
    const { isShown } = resolveDebugState(this.debugging, cfg.debugging)
    if (!isShown) return

    const descriptor = createBaselineDescriptor({
      base: resolvedBase,
      colors: cfg.colors,
      variant: this.variant ?? cfg.variant,
      width: this.width,
      height: this.height,
      color: this.color,
      containerWidth: this._containerWidth,
      containerHeight: this._containerHeight,
      spacing: {},
      isVisible: isShown,
    })

    this._virtualHandle?.disconnect()
    this._virtualHandle = createVirtualTracker(
      el,
      { totalItems: descriptor.rowCount, itemHeight: resolvedBase, buffer: 160 },
      (range) => {
        this._virtualStart = range.start
        this._virtualEnd = range.end
        this.requestUpdate()
      }
    )
  }

  override render() {
    const cfg = this._config.baseline
    const resolvedBase = this.base ?? this._config.base
    const { isShown } = resolveDebugState(this.debugging, cfg.debugging)

    if (!isShown) {
      return html`<div class="bas" aria-hidden="true"></div>`
    }

    const descriptor = createBaselineDescriptor({
      base: resolvedBase,
      colors: cfg.colors,
      variant: this.variant ?? cfg.variant,
      width: this.width,
      height: this.height,
      color: this.color,
      containerWidth: this._containerWidth,
      containerHeight: this._containerHeight,
      spacing: {},
      isVisible: isShown,
    })

    const count = this._virtualEnd - this._virtualStart
    const rows = count > 0
      ? Array.from({ length: count }, (_, i) => {
          const rowIndex = i + this._virtualStart
          return html`<div class="row" style=${styleMap(descriptor.getRowStyle(rowIndex))}></div>`
        })
      : nothing

    return html`
      <div
        ${ref(this._containerRef)}
        class=${cx('bas')}
        aria-hidden="true"
        style=${styleMap(descriptor.containerStyle)}
      >
        ${rows}
      </div>
    `
  }
}

customElements.define('bk-baseline', BkBaseline)

declare global {
  interface HTMLElementTagNameMap {
    'bk-baseline': BkBaseline
  }
}
