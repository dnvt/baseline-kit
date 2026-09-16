import { clientEntry, type Handle, type RemixNode } from 'remix/ui'
import { jsx } from 'remix/ui/jsx-runtime'

export const Forwarder = clientEntry(
  `${import.meta.url}#Forwarder`,
  (handle: Handle) => () =>
    jsx('div', {
      children: (handle.props.content ?? handle.props.children) as RemixNode,
    })
)
