import * as React from 'react'

/**
 * Host element props every React component accepts on top of its core
 * options. Only global attributes are forwarded to the DOM.
 */
export type HostProps = {
  className?: string
  style?: React.CSSProperties
} & React.AriaAttributes & {
    id?: string
    title?: string
    role?: React.AriaRole
    tabIndex?: number
    lang?: string
    dir?: string
    hidden?: boolean
    [key: `data-${string}`]: string | number | boolean | undefined
  }
