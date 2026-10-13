import { clientEntry, type Handle, type RemixNode } from 'remix/component'
import { jsx } from 'remix/component/jsx-runtime'
import { Box, Padder } from '@baseline-kit/remix'

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

const LIVE_TEXTS = [
  'Sphinx of black quartz, judge my vow.',
  'The five boxing wizards jump quickly over the lazy dog at dawn.',
  'Pack my box with five dozen liquor jugs, then stack them on the grid line by line.',
  'How vexingly quick daft zebras jump.',
  'A wizard’s job is to vex chumps quickly in fog while the baseline keeps every line in step with the page.',
]

const liveText = (font: { size: number; family: string }, index: number) => ({
  display: 'block',
  fontFamily: font.family,
  fontSize: `${font.size + (index % 5) * 0.125}rem`,
  lineHeight: 1.3,
})

/** Each DOM variant of a Box (see the React LiveGridFixture). */
const LIVE_VARIANTS: Record<string, unknown>[] = [
  {},
  { className: 'live-c' },
  { className: 'live-c', debugging: 'none' },
  { as: 'h3' },
]

/** The live-grid hosts of the React LiveGridFixture, for the Remix entry. */
export const LiveGridProbe = clientEntry(
  `${import.meta.url}#LiveGridProbe`,
  (handle: Handle) => {
    let on = false
    let width = 360
    let font = { size: 1, family: 'serif' }
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(location.search)
      if (params.has('live')) {
        width = Number(params.get('liveWidth') ?? 360)
        ;(
          window as unknown as {
            __setLiveFont: (next: { size?: number; family?: string }) => void
          }
        ).__setLiveFont = (next) => {
          font = { ...font, ...next }
          handle.update()
        }
        queueMicrotask(() => {
          on = true
          handle.update()
        })
      }
    }
    const text = (index: number, content = LIVE_TEXTS[index % 5]) =>
      jsx('span', { style: liveText(font, index), children: content })
    return () =>
      on
        ? jsx('section', {
            id: 'remix-live-grid',
            style: { width: `${width}px` },
            children: [
              jsx('style', {
                children:
                  '.live-transition .bk-box, .live-transition .bk-box * { transition: all 120ms linear; }',
              }),
              ...Array.from({ length: 50 }, (_, index) =>
                jsx(Box, {
                  'data-live': 'box',
                  snapping: Math.floor(index / 4) % 2 ? 'height' : 'clamp',
                  block: [0, 0],
                  ...LIVE_VARIANTS[index % 4],
                  children: text(index),
                })
              ),
              jsx(Padder, {
                'data-live': 'box',
                block: [0, 0],
                children: text(3),
              }),
              jsx(Padder, {
                'data-live': 'box',
                debugging: 'none',
                block: [0, 0],
                children: text(4),
              }),
              // A snapping host around another: it re-snaps after the inner one.
              jsx(Padder, {
                'data-live': 'nested',
                debugging: 'none',
                block: [0, 0],
                children: jsx(Box, {
                  'data-live': 'box',
                  block: [0, 0],
                  children: text(2),
                }),
              }),
              jsx('div', {
                style: { zoom: 1.25 },
                children: LIVE_VARIANTS.map((variant, index) =>
                  jsx(Box, {
                    'data-live': 'zoom',
                    block: [0, 0],
                    ...variant,
                    children: text(index),
                  })
                ),
              }),
              jsx(Box, {
                'data-live': 'fixed',
                height: 100,
                snapping: 'height',
                block: [0, 0],
                children: text(4),
              }),
              // Hosts whose height has a floor: min-height, and a flex fill.
              ...['99px', '101px', '6.3rem'].map((minHeight, index) =>
                jsx(Box, {
                  'data-live': 'floor',
                  style: { minHeight },
                  snapping: index % 2 ? 'height' : 'clamp',
                  block: [0, 0],
                  children: text(index),
                })
              ),
              // 96px of content under a 99px floor: padding moves it 99 -> 101.
              jsx(Box, {
                'data-live': 'floor',
                style: { minHeight: '99px' },
                block: [0, 0],
                children: jsx('div', { style: { height: '96px' } }),
              }),
              jsx('div', {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  height: '203px',
                },
                children: [
                  jsx(Box, {
                    'data-live': 'box',
                    block: [0, 0],
                    children: text(1, LIVE_TEXTS[0]),
                  }),
                  jsx(Box, {
                    'data-live': 'floor',
                    style: { flex: 1 },
                    block: [0, 0],
                    children: text(2, LIVE_TEXTS[3]),
                  }),
                ],
              }),
              // Boxes whose padding a CSS transition animates.
              jsx('div', {
                className: 'live-transition',
                children: LIVE_VARIANTS.map((variant, index) =>
                  jsx(Box, {
                    'data-live': 'transition',
                    snapping: index % 2 ? 'height' : 'clamp',
                    block: [0, 0],
                    ...variant,
                    children: text(index, LIVE_TEXTS[index + 1]),
                  })
                ),
              }),
              jsx(Box, {
                'data-live': 'toggle-twin',
                block: [0, 0],
                children: jsx('div', { style: { height: '10px' } }),
              }),
              jsx(Box, {
                'data-live': 'toggle',
                block: [0, 0],
                children: jsx('div', {
                  'data-live-toggle': '',
                  style: { height: '10px' },
                }),
              }),
            ],
          })
        : null
  }
)
