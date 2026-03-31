import { html, css } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import {
  cx,
  resolveDebugState,
  createLayoutDescriptor,
} from '@baseline-kit/core'
import { BkBase } from './bk-base.js'

/**
 * <bk-layout> — CSS Grid layout container.
 */
export class BkLayout extends BkBase {
  static override properties = {
    debugging: {},
    columns: {},
    rows: {},
    width: {},
    height: {},
    gap: { type: Number },
    rowGap: { type: Number, attribute: 'row-gap' },
    columnGap: { type: Number, attribute: 'column-gap' },
    justifyItems: { attribute: 'justify-items' },
    alignItems: { attribute: 'align-items' },
    justifyContent: { attribute: 'justify-content' },
    alignContent: { attribute: 'align-content' },
  }

  static override styles = css`
    :host { display: block; }
    .lay {
      display: grid;
      position: relative;
      box-sizing: border-box;
      width: var(--bkly-w, auto);
      height: var(--bkly-h, auto);
      grid-template-columns: var(--bkly-gtc, repeat(auto-fill, minmax(100px, 1fr)));
      grid-template-rows: var(--bkly-gtr, auto);
      gap: var(--bkly-g, 0);
      column-gap: var(--bkly-cg, 0);
      row-gap: var(--bkly-rg, 0);
      justify-items: var(--bkly-ji, stretch);
      align-items: var(--bkly-ai, stretch);
      justify-content: var(--bkly-jc, start);
      align-content: var(--bkly-ac, start);
    }
    .v::after {
      content: '';
      position: absolute;
      inset: 0;
      border: 1px solid var(--bkly-cl, hsla(330, 60%, 40%, 0.6));
      pointer-events: none;
      z-index: var(--bk-zio, 2);
    }
  `

  declare debugging: 'visible' | 'hidden' | 'none' | undefined
  declare columns: string | number | undefined
  declare rows: string | number | undefined
  declare width: string | number | undefined
  declare height: string | number | undefined
  declare gap: number | undefined
  declare rowGap: number | undefined
  declare columnGap: number | undefined
  declare justifyItems: string | undefined
  declare alignItems: string | undefined
  declare justifyContent: string | undefined
  declare alignContent: string | undefined

  override render() {
    const cfg = this._config.layout
    const { isShown } = resolveDebugState(this.debugging, cfg.debugging)

    const descriptor = createLayoutDescriptor({
      colors: cfg.colors,
      columns: this.columns,
      rows: this.rows,
      width: this.width as number | string | undefined,
      height: this.height as number | string | undefined,
      gap: this.gap as number | string | undefined,
      rowGap: this.rowGap as number | string | undefined,
      columnGap: this.columnGap as number | string | undefined,
      justifyItems: this.justifyItems,
      alignItems: this.alignItems,
      justifyContent: this.justifyContent,
      alignContent: this.alignContent,
    })

    return html`
      <div class=${cx(...descriptor.classTokens, isShown ? 'v' : undefined)} style=${styleMap(descriptor.containerStyle)}>
        <slot></slot>
      </div>
    `
  }
}

customElements.define('bk-layout', BkLayout)

declare global {
  interface HTMLElementTagNameMap {
    'bk-layout': BkLayout
  }
}
