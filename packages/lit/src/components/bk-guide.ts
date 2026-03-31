import { html, css, nothing } from 'lit'
import { createRef, ref } from 'lit/directives/ref.js'
import { styleMap } from 'lit/directives/style-map.js'
import type { GuideVariant } from '@baseline-kit/core'
import {
  cx,
  resolveDebugState,
  createGuideDescriptor,
  createGuideConfig,
  calculateGuideTemplate,
} from '@baseline-kit/core'
import { createMeasureObserver } from '@baseline-kit/dom'
import type { MeasureObserverHandle } from '@baseline-kit/dom'
import { BkBase } from './bk-base.js'

/**
 * <bk-guide> — Column guide overlay.
 */
export class BkGuide extends BkBase {
  static override properties = {
    variant: {},
    debugging: {},
    color: {},
    width: {},
    height: {},
    maxWidth: { attribute: 'max-width' },
    columnWidth: { attribute: 'column-width' },
    align: {},
    gap: { type: Number },
    columns: { type: Number },
    _containerWidth: { state: true },
    _containerHeight: { state: true },
  }

  static override styles = css`
    :host { display: block; }
    .gde {
      position: absolute;
      inset: 0;
      pointer-events: none;
      padding: var(--bkgd-pb) var(--bkgd-pi);
    }
    .line { left: -0.5px; }
    .cols {
      position: absolute;
      inset: 0;
      display: grid;
      column-gap: var(--bkgd-g);
      grid-template-rows: 1fr;
      grid-template-columns: var(--bkgd-t);
      justify-content: var(--bkgd-j);
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    .col {
      min-width: 0;
      width: 100%;
      height: 100%;
    }
    .col[data-variant='line'] { width: 1px; background-color: var(--bkgd-cl); }
    .col[data-variant='pattern'] { background-color: var(--bkgd-cp); }
    .col[data-variant='auto'] { background-color: var(--bkgd-ca); overflow: hidden; }
    .col[data-variant='fixed'] { background-color: var(--bkgd-cf); }
  `

  declare variant: GuideVariant | undefined
  declare debugging: 'visible' | 'hidden' | 'none' | undefined
  declare color: string | undefined
  declare width: string | number | undefined
  declare height: string | number | undefined
  declare maxWidth: string | number | undefined
  declare columnWidth: string | number | undefined
  declare align: string | undefined
  declare gap: number | undefined
  declare columns: number | undefined

  private _containerWidth = 0
  private _containerHeight = 0

  private _containerRef = createRef<HTMLDivElement>()
  private _measureHandle?: MeasureObserverHandle

  override disconnectedCallback() {
    super.disconnectedCallback()
    this._measureHandle?.disconnect()
  }

  override updated() {
    const el = this._containerRef.value
    if (!el || this._measureHandle) return

    this._measureHandle = createMeasureObserver(el, (rect) => {
      this._containerWidth = rect.width
      this._containerHeight = rect.height
      this.requestUpdate()
    })
  }

  override render() {
    const cfg = this._config.guide
    const resolvedVariant = (this.variant ?? cfg.variant) as GuideVariant
    const resolvedGap = this.gap ?? 0
    const { isShown } = resolveDebugState(this.debugging, cfg.debugging)

    if (!isShown) {
      return html`<div class="gde" aria-hidden="true"><slot></slot></div>`
    }

    const gridConfig = createGuideConfig(
      resolvedVariant,
      this._config.base,
      resolvedGap,
      this.columns,
      this.columnWidth as number | string | undefined
    )

    const { template, columnsCount, calculatedGap } = calculateGuideTemplate(
      this._containerWidth,
      gridConfig
    )

    const descriptor = createGuideDescriptor({
      base: this._config.base,
      colors: cfg.colors,
      variant: resolvedVariant,
      align: this.align ?? 'center',
      width: this.width,
      height: this.height,
      columnWidth: this.columnWidth,
      maxWidth: this.maxWidth,
      color: this.color,
      containerWidth: this._containerWidth,
      containerHeight: this._containerHeight,
      template,
      columnsCount,
      calculatedGap,
      isVisible: isShown,
    })

    const columnEls = Array.from({ length: descriptor.columnsCount }, (_, i) =>
      html`<div class="col" data-variant=${resolvedVariant} style="background-color: ${descriptor.columnColor}"></div>`
    )

    return html`
      <div
        ${ref(this._containerRef)}
        class=${cx('gde', resolvedVariant === 'line' ? 'line' : undefined)}
        aria-hidden="true"
        style=${styleMap(descriptor.containerStyle)}
      >
        <div class="cols" data-variant=${resolvedVariant}>${columnEls}</div>
        <slot></slot>
      </div>
    `
  }
}

customElements.define('bk-guide', BkGuide)

declare global {
  interface HTMLElementTagNameMap {
    'bk-guide': BkGuide
  }
}
