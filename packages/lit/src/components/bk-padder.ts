import { html, css } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import {
  cx,
  resolveDebugState,
  createPadderDescriptor,
  parsePadding,
} from '@baseline-kit/core'
import { BkBase } from './bk-base.js'

/**
 * <bk-padder> — Padding container with spacer visualization.
 */
export class BkPadder extends BkBase {
  static override properties = {
    debugging: {},
    width: {},
    height: {},
    block: { type: Number },
    inline: { type: Number },
    top: { type: Number },
    right: { type: Number },
    bottom: { type: Number },
    left: { type: Number },
  }

  static override styles = css`
    :host { display: block; }
    .pad {
      position: relative;
      display: grid;
      grid-template-columns: auto 1fr auto;
      grid-template-rows: auto 1fr auto;
      width: var(--bkpd-w, auto);
      height: var(--bkpd-h, auto);
    }
    .v::after {
      content: '';
      position: absolute;
      inset: 0;
      border: 1px solid var(--bkpd-c, var(--bk-padder-color-theme));
      pointer-events: none;
      z-index: var(--bk-zi, 1);
    }
    .full-row { grid-column: 1 / -1; }
    .mid-col { grid-row: 2 / 3; }
    .center { grid-row: 2 / 3; grid-column: 2 / 3; }
  `

  declare debugging: 'visible' | 'hidden' | 'none' | undefined
  declare width: string | number | undefined
  declare height: string | number | undefined
  declare block: number | undefined
  declare inline: number | undefined
  declare top: number | undefined
  declare right: number | undefined
  declare bottom: number | undefined
  declare left: number | undefined

  override render() {
    const cfg = this._config.padder
    const { isShown, isNone } = resolveDebugState(this.debugging, cfg.debugging)
    const enableSpacers = !isNone

    const padding = parsePadding({
      block: this.block != null ? [this.top ?? this.block, this.bottom ?? this.block] : undefined,
      inline: this.inline != null ? [this.left ?? this.inline, this.right ?? this.inline] : undefined,
    })

    const descriptor = createPadderDescriptor({
      base: this._config.base,
      color: cfg.color,
      width: this.width as number | string | undefined,
      height: this.height as number | string | undefined,
      padding,
      enableSpacers,
      isVisible: isShown,
    })

    if (!enableSpacers) {
      return html`
        <div class=${cx(...descriptor.classTokens)} style=${styleMap(descriptor.containerStyle)}>
          <slot></slot>
        </div>
      `
    }

    return html`
      <div class=${cx(...descriptor.classTokens)} style=${styleMap(descriptor.containerStyle)}>
        ${padding.top >= 0 ? html`<div class="full-row">
          <bk-spacer width="100%" height=${padding.top} debugging=${this.debugging ?? 'none'}></bk-spacer>
        </div>` : ''}
        ${padding.left >= 0 ? html`<div class="mid-col">
          <bk-spacer width=${padding.left} height="100%" debugging=${this.debugging ?? 'none'}></bk-spacer>
        </div>` : ''}
        <div class="center"><slot></slot></div>
        ${padding.right >= 0 ? html`<div class="mid-col">
          <bk-spacer width=${padding.right} height="100%" debugging=${this.debugging ?? 'none'}></bk-spacer>
        </div>` : ''}
        ${padding.bottom >= 0 ? html`<div class="full-row">
          <bk-spacer width="100%" height=${padding.bottom} debugging=${this.debugging ?? 'none'}></bk-spacer>
        </div>` : ''}
      </div>
    `
  }
}

customElements.define('bk-padder', BkPadder)

declare global {
  interface HTMLElementTagNameMap {
    'bk-padder': BkPadder
  }
}
