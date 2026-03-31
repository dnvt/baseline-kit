import { LitElement } from 'lit'
import { ContextConsumer } from '@lit/context'
import type { ConfigSchema } from '@baseline-kit/core'
import { DEFAULT_CONFIG } from '@baseline-kit/core'
import { configContext } from '../controllers/config-context.js'

/**
 * Base class for all baseline-kit Lit components.
 * Automatically consumes the bk-config context.
 */
export class BkBase extends LitElement {
  protected _config: ConfigSchema = DEFAULT_CONFIG

  private _consumer = new ContextConsumer(this, {
    context: configContext,
    subscribe: true,
    callback: (value) => {
      this._config = value
      this.requestUpdate()
    },
  })
}
