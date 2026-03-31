import { createContext } from '@lit/context'
import type { ConfigSchema } from '@baseline-kit/core'

/**
 * Lit context key for baseline-kit configuration.
 * Consumed via ContextConsumer, provided by <bk-config> via ContextProvider.
 */
export const configContext = createContext<ConfigSchema>('bk-config')
