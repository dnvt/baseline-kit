import { html, css } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import {
  cx,
  resolveDebugState,
  createSpacerDescriptor,
} from '@baseline-kit/core'
import { BkBase } from './bk-base.js'

/**
 * <bk-spacer> — Visual spacing indicator.
 */
export class BkSpacer extends BkBase {
  static override properties = {
    variant: {},
    debugging: {},
    color: {},
    width: {},
    height: {},
    base: { type: Number },
  }

  static override styles = css`
    :host {
      display: block;
    }
    .spr {
      position: relative;
      box-sizing: border-box;
      width: var(--bksp-w, 100%);
      height: var(--bksp-h, auto);
      flex-shrink: 0;
      display: block;
      margin: 0;
      padding: 0;
    }
    .line::after {
      content: '';
      position: absolute;
      inset: 0;
      border: 1px solid var(--bksp-cl, hsla(270, 60%, 40%, 0.6));
      z-index: var(--bk-zi, 1);
    }
    .flat {
      background-color: var(--bksp-cf, hsla(230, 100%, 70%, 0.2));
    }
  `

  declare variant: string | undefined
  declare debugging: 'visible' | 'hidden' | 'none' | undefined
  declare color: string | undefined
  declare width: string | number | undefined
  declare height: string | number | undefined
  declare base: number | undefined

  override render() {
    const cfg = this._config.spacer
    const variant = this.variant ?? cfg.variant
    const base = this.base ?? this._config.base
    const { isShown } = resolveDebugState(this.debugging, cfg.debugging)

    const descriptor = createSpacerDescriptor({
      base,
      colors: cfg.colors,
      width: this.width as number | string | undefined,
      height: this.height as number | string | undefined,
      color: this.color,
      variant,
      isVisible: isShown,
    })

    return html`
      <div
        class=${cx('spr', ...descriptor.classTokens.slice(1))}
        data-variant=${variant}
        style=${styleMap(descriptor.style)}
      >
        <slot></slot>
      </div>
    `
  }
}

customElements.define('bk-spacer', BkSpacer)

declare global {
  interface HTMLElementTagNameMap {
    'bk-spacer': BkSpacer
  }
}
