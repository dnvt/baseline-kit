import { html, css } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import {
  cx,
  resolveDebugState,
  createBoxDescriptor,
} from '@baseline-kit/core'
import { BkBase } from './bk-base.js'

/**
 * <bk-box> — Box container with optional debug border.
 */
export class BkBox extends BkBase {
  static override properties = {
    debugging: {},
    width: {},
    height: {},
    colSpan: { type: Number, attribute: 'col-span' },
    rowSpan: { type: Number, attribute: 'row-span' },
    span: { type: Number },
  }

  static override styles = css`
    :host { display: block; }
    .box {
      position: relative;
      width: var(--bkbx-w);
      height: var(--bkbx-h);
    }
    .v::after {
      content: '';
      position: absolute;
      inset: 0;
      border: 1px solid var(--bkbx-cl);
      pointer-events: none;
      z-index: var(--bk-zi, 1);
    }
  `

  declare debugging: 'visible' | 'hidden' | 'none' | undefined
  declare width: string | number | undefined
  declare height: string | number | undefined
  declare colSpan: number | undefined
  declare rowSpan: number | undefined
  declare span: number | undefined

  override render() {
    const cfg = this._config.box
    const { isShown } = resolveDebugState(this.debugging, cfg.debugging)

    const descriptor = createBoxDescriptor({
      base: this._config.base,
      lineColor: cfg.colors.line,
      width: this.width as number | string | undefined,
      height: this.height as number | string | undefined,
      span: this.span,
      colSpan: this.colSpan,
      rowSpan: this.rowSpan,
      isVisible: isShown,
    })

    const mergedStyle = { ...descriptor.boxStyle, ...descriptor.gridSpanStyle }

    return html`
      <div class=${cx(...descriptor.classTokens)} style=${styleMap(mergedStyle)}>
        <slot></slot>
      </div>
    `
  }
}

customElements.define('bk-box', BkBox)

declare global {
  interface HTMLElementTagNameMap {
    'bk-box': BkBox
  }
}
