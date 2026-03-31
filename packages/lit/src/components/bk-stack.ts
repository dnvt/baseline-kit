import { html, css } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import {
  cx,
  resolveDebugState,
  createStackDescriptor,
} from '@baseline-kit/core'
import { BkBase } from './bk-base.js'

/**
 * <bk-stack> — Flex container with directional stacking.
 */
export class BkStack extends BkBase {
  static override properties = {
    debugging: {},
    direction: {},
    justify: {},
    align: {},
    width: {},
    height: {},
    gap: { type: Number },
    rowGap: { type: Number, attribute: 'row-gap' },
    columnGap: { type: Number, attribute: 'column-gap' },
  }

  static override styles = css`
    :host { display: block; }
    .stk {
      display: flex;
      position: relative;
      width: var(--bksk-w);
      height: var(--bksk-h);
    }
    .v::after {
      content: '';
      position: absolute;
      inset: 0;
      border: 1px solid var(--bksk-cl, hsla(330, 60%, 40%, 0.6));
      pointer-events: none;
      z-index: var(--bk-zio, 2);
    }
    .flat {
      background-color: var(--bksk-cf, hsla(0, 100%, 70%, 0.2));
    }
  `

  declare debugging: 'visible' | 'hidden' | 'none' | undefined
  declare direction: string | undefined
  declare justify: string | undefined
  declare align: string | undefined
  declare width: string | number | undefined
  declare height: string | number | undefined
  declare gap: number | undefined
  declare rowGap: number | undefined
  declare columnGap: number | undefined

  override render() {
    const cfg = this._config.stack
    const { isShown } = resolveDebugState(this.debugging, cfg.debugging)

    const descriptor = createStackDescriptor({
      colors: cfg.colors,
      direction: this.direction ?? 'row',
      justify: this.justify ?? 'flex-start',
      align: this.align ?? 'flex-start',
      width: this.width as number | string | undefined,
      height: this.height as number | string | undefined,
      gap: this.gap,
      rowGap: this.rowGap,
      columnGap: this.columnGap,
      isVisible: isShown,
    })

    return html`
      <div class=${cx(...descriptor.classTokens)} style=${styleMap(descriptor.containerStyle)}>
        <slot></slot>
      </div>
    `
  }
}

customElements.define('bk-stack', BkStack)

declare global {
  interface HTMLElementTagNameMap {
    'bk-stack': BkStack
  }
}
