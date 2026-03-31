import { LitElement, html } from 'lit'
import { ContextProvider } from '@lit/context'
import type { ConfigSchema } from '@baseline-kit/core'
import { DEFAULT_CONFIG, mergeConfig } from '@baseline-kit/core'
import { configContext } from '../controllers/config-context.js'

/**
 * <bk-config> — Configuration provider for baseline-kit Lit components.
 *
 * @example
 * ```html
 * <bk-config base="4">
 *   <bk-baseline></bk-baseline>
 * </bk-config>
 * ```
 */
export class BkConfig extends LitElement {
  static override properties = {
    base: { type: Number },
  }

  declare base: number | undefined

  private _provider = new ContextProvider(this, {
    context: configContext,
    initialValue: DEFAULT_CONFIG,
  })

  override willUpdate() {
    const config = mergeConfig({
      parentConfig: DEFAULT_CONFIG,
      base: this.base,
    })
    this._provider.setValue(config)
  }

  override render() {
    return html`<slot></slot>`
  }
}

customElements.define('bk-config', BkConfig)

declare global {
  interface HTMLElementTagNameMap {
    'bk-config': BkConfig
  }
}
