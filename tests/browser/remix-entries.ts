import { clientEntry, type Handle, type RemixNode } from 'remix/component'
import { jsx } from 'remix/component/jsx-runtime'
import { Box } from '@baseline-kit/remix'

export const Forwarder = clientEntry(
  `${import.meta.url}#Forwarder`,
  (handle: Handle) => () =>
    jsx('div', {
      children: (handle.props.content ?? handle.props.children) as RemixNode,
    })
)

/** Lets tests switch a Box's snapping mode and content height. */
export const SnapModeProbe = clientEntry(
  `${import.meta.url}#SnapModeProbe`,
  (handle: Handle) => {
    let mode: 'clamp' | 'none' = 'clamp'
    let height = 100
    if (typeof window !== 'undefined') {
      ;(
        window as unknown as {
          __setRemixSnapProbe: (next: {
            mode?: 'clamp' | 'none'
            height?: number
          }) => void
        }
      ).__setRemixSnapProbe = (next) => {
        mode = next.mode ?? mode
        height = next.height ?? height
        handle.update()
      }
    }
    return () =>
      jsx(Box, {
        id: 'remix-mode-probe',
        snapping: mode,
        block: [0, 0],
        children: jsx('div', { style: { height: `${height}px` } }),
      })
  }
)
