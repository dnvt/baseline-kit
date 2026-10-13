import { Frame } from 'remix/component'
import { jsx } from 'remix/component/jsx-runtime'
import { Forwarder, LiveGridProbe, SnapModeProbe } from './remix-entries'
import { COST_BOX_COUNT, COST_CSS, COST_WORDS, costBox } from './cost-grid'
import {
  REM_GRID_BOXES,
  REM_GRID_CSS,
  REM_GRID_MARK,
  REM_GRID_SECTION,
  REM_GRID_WORDS,
  remGridText,
} from './rem-grid'
import {
  Baseline,
  Box,
  Config,
  Guide,
  Padder,
  Spacer,
} from '@baseline-kit/remix'

const dimensionCases = [
  { id: 'width-omitted', axis: 'width', value: undefined },
  { id: 'width-half', axis: 'width', value: '50%' },
  { id: 'width-viewport', axis: 'width', value: '100vw' },
  { id: 'width-calc', axis: 'width', value: 'calc(100% - 24px)' },
  { id: 'width-pixels', axis: 'width', value: 160 },
  { id: 'width-zero', axis: 'width', value: 0 },
  { id: 'height-omitted', axis: 'height', value: undefined },
  { id: 'height-half', axis: 'height', value: '50%' },
  { id: 'height-full', axis: 'height', value: '100%' },
  { id: 'height-vh', axis: 'height', value: '100vh' },
  { id: 'height-vw', axis: 'height', value: '100vw' },
  { id: 'height-dvh', axis: 'height', value: '100dvh' },
  { id: 'height-rem', axis: 'height', value: '10rem' },
  { id: 'height-em', axis: 'height', value: '10em' },
  { id: 'height-calc', axis: 'height', value: 'calc(100% - 24px)' },
  { id: 'height-pixels', axis: 'height', value: 160 },
  { id: 'height-zero', axis: 'height', value: 0 },
] as const

/** The `?remgrid` hosts (see rem-grid.ts), server-rendered then hydrated. */
function remGrid(base: number | `${number}rem`) {
  return jsx('section', {
    'data-rem-grid': typeof base === 'number' ? 'px' : 'rem',
    style: REM_GRID_SECTION,
    children: [
      jsx('style', { children: REM_GRID_CSS }),
      jsx(Config, {
        base,
        children: [
          ...REM_GRID_BOXES.map((box, index) =>
            jsx(
              Box,
              {
                'data-rem': 'box',
                block: [0, 0],
                snapping: box.snapping,
                ...box.variant,
                children: [
                  jsx('span', {
                    style: remGridText(box.size),
                    children: REM_GRID_WORDS.flatMap((word) => [
                      `${word} `,
                      jsx('span', {
                        'data-rem-mark': '',
                        style: REM_GRID_MARK,
                      }),
                    ]),
                  }),
                  jsx('span', {
                    style: { display: 'block', height: box.trailer },
                  }),
                ],
              },
              index
            )
          ),
          // Rounds 20px to the base: 24px at 8px, 20px at 10px.
          jsx(Spacer, { 'data-rem': 'spacer', height: 20 }),
        ],
      }),
    ],
  })
}

/** The `?cost=rem|px` hosts (see cost-grid.ts). */
function costGrid(kind: 'rem' | 'px') {
  return jsx('section', {
    'data-cost-grid': kind,
    style: REM_GRID_SECTION,
    children: [
      jsx('style', { children: COST_CSS }),
      jsx(Config, {
        base: kind === 'rem' ? '0.5rem' : 8,
        children: [
          ...Array.from({ length: COST_BOX_COUNT }, (_, index) => {
            const box = costBox(index)
            return jsx(
              Box,
              {
                'data-cost': 'box',
                block: [0, 0],
                snapping: box.snapping,
                ...box.variant,
                children: [
                  jsx('span', {
                    style: remGridText(box.size),
                    children: COST_WORDS.flatMap((word) => [
                      `${word} `,
                      jsx('span', { style: REM_GRID_MARK }),
                    ]),
                  }),
                  jsx('span', {
                    style: { display: 'block', height: box.trailer },
                  }),
                ],
              },
              index
            )
          }),
          jsx(Box, {
            'data-cost': 'px-content',
            block: [0, 0],
            children: jsx('div', { style: { height: '45px' } }),
          }),
        ],
      }),
    ],
  })
}

export function createRemixApp(search = '') {
  const params = new URLSearchParams(search)
  const remGridOn = params.has('remgrid')
  const cost = params.get('cost')
  const GeneratedConsumer = () => () =>
    jsx(Spacer, { height: 16, debugging: 'visible' })
  const WrappedConsumers = () => () =>
    jsx('section', {
      id: 'remix-wrapped-config',
      children: [
        jsx(Spacer, { height: 16, debugging: 'visible' }),
        jsx(Box, { debugging: 'visible', children: 'Wrapped box' }),
        jsx(Padder, { debugging: 'visible', children: 'Wrapped padder' }),
        jsx('div', {
          style: { position: 'relative', width: 320, height: 48 },
          children: [
            jsx(Baseline, { height: 48, debugging: 'visible' }),
            jsx(Guide, { variant: 'fixed', columns: 4, debugging: 'visible' }),
          ],
        }),
      ],
    })
  const dimensionMatrix = dimensionCases.map(({ id, axis, value }) =>
    jsx('div', {
      id: `remix-dimension-${id}`,
      key: id,
      style: { position: 'relative', width: 400, height: 240, fontSize: 16 },
      children: jsx(Baseline, {
        debugging: 'visible',
        base: 8,
        width: axis === 'width' ? value : '100%',
        height: axis === 'height' ? value : 40,
      }),
    })
  )

  const app = jsx('main', {
    children: [
      ...(remGridOn ? [remGrid('0.5rem'), remGrid(8)] : []),
      ...(cost === 'rem' || cost === 'px' ? [costGrid(cost)] : []),
      jsx('section', {
        id: 'remix-frame-lifecycle',
        children: [
          jsx('nav', {
            id: 'remix-frame-navigation',
            children: [
              jsx('a', {
                id: 'remix-frame-nav-a',
                href: '/remix-lifecycle-a',
                'data-rmx-target': 'lifecycle',
                'data-rmx-history': 'push',
                children: 'Frame A',
              }),
              jsx('a', {
                id: 'remix-frame-nav-b',
                href: '/remix-lifecycle-b',
                'data-rmx-target': 'lifecycle',
                'data-rmx-history': 'push',
                children: 'Frame B',
              }),
            ],
          }),
          jsx(Frame, {
            name: 'lifecycle',
            src: '/remix-lifecycle-a',
          }),
        ],
      }),
      ...['children', 'content'].map((slot) =>
        jsx('section', {
          id: `remix-entry-${slot}`,
          children: jsx(Config, {
            base: 12,
            spacer: { colors: { line: 'red' } },
            children: jsx(Forwarder, {
              [slot]: jsx(Config, {
                base: 4,
                spacer: { colors: { line: 'blue' } },
                children: jsx(GeneratedConsumer, {}),
              }),
            }),
          }),
        })
      ),
      jsx('section', {
        id: 'remix-nested-hydration',
        children: jsx(Config, {
          base: 12,
          spacer: { colors: { line: 'red' } },
          children: jsx(Box, {
            snapping: 'none',
            children: jsx(Config, {
              base: 4,
              spacer: { colors: { line: 'blue' } },
              children: jsx(Spacer, { height: 16, debugging: 'visible' }),
            }),
          }),
        }),
      }),
      jsx('section', {
        id: 'remix-guide-viewport',
        style: { position: 'relative', width: 320, height: 160 },
        children: jsx(Guide, {
          width: '100vw',
          height: '100vh',
          debugging: 'visible',
        }),
      }),
      jsx('section', {
        id: 'remix-guide-paint-parity',
        children: [
          jsx('div', {
            id: 'remix-guide-paint-reference',
            style: { position: 'relative', width: 320, height: 32 },
            children: jsx(Config, {
              domDiagnostics: true,
              children: jsx(Guide, {
                id: 'remix-guide-paint-reference-host',
                variant: 'fixed',
                columns: 4,
                debugging: 'visible',
              }),
            }),
          }),
          jsx(Config, {
            domDiagnostics: false,
            children: jsx('div', {
              id: 'remix-guide-paint-compact',
              style: { position: 'relative', width: 320, height: 32 },
              children: jsx(Guide, {
                id: 'remix-guide-paint-compact-host',
                variant: 'fixed',
                columns: 4,
                debugging: 'visible',
              }),
            }),
          }),
        ],
      }),
      jsx('section', {
        id: 'remix-padder-snap',
        children: jsx(Padder, {
          debugging: 'none',
          children: jsx('div', { style: { width: 20, height: 10 } }),
        }),
      }),
      jsx(Config, {
        domDiagnostics: false,
        children: jsx('section', {
          id: 'remix-zero-padding-components',
          children: [
            jsx(Box, {
              id: 'remix-zero-padding-box',
              debugging: 'hidden',
              ssrMode: true,
              children: jsx('span', {
                id: 'remix-zero-padding-box-child',
                children: 'Box child',
              }),
            }),
            jsx(Padder, {
              id: 'remix-zero-padding-padder',
              debugging: 'visible',
              ssrMode: true,
              children: jsx('span', {
                id: 'remix-zero-padding-padder-child',
                children: 'Padder child',
              }),
            }),
            jsx(Padder, {
              id: 'remix-right-only-padder',
              padding: { right: 24 },
              debugging: 'hidden',
              ssrMode: true,
              children: jsx('div', {
                id: 'remix-right-only-content',
                style: { width: 100, height: 20 },
              }),
            }),
            jsx(Padder, {
              id: 'remix-bottom-only-padder',
              padding: { bottom: 24 },
              debugging: 'hidden',
              ssrMode: true,
              children: jsx('div', {
                id: 'remix-bottom-only-content',
                style: { width: 100, height: 20 },
              }),
            }),
          ],
        }),
      }),
      jsx(Config, {
        base: 12,
        spacer: { colors: { line: 'red' } },
        box: { colors: { line: 'red' } },
        padder: { color: 'red' },
        baseline: { colors: { line: 'red' } },
        guide: { colors: { fixed: 'red' } },
        children: jsx(WrappedConsumers, {}),
      }),
      jsx('p', {
        id: 'remix-ssr-content',
        children: 'Server-rendered Remix content remains available.',
      }),
      jsx('section', {
        id: 'remix-baseline-percent',
        style: { position: 'relative', width: 320, height: 160 },
        children: jsx(Baseline, {
          debugging: 'visible',
          base: 8,
          width: '100%',
          height: '100%',
        }),
      }),
      jsx('section', {
        id: 'remix-baseline-default-paint',
        style: { position: 'relative', width: 320, height: 16 },
        children: jsx(Baseline, {
          debugging: 'visible',
          base: 8,
          width: '100%',
          height: 16,
        }),
      }),
      jsx('section', {
        id: 'remix-box-caller-layout',
        children: jsx(Box, {
          id: 'remix-caller-layout-box',
          style: { display: 'flex' },
          block: 8,
          debugging: 'visible',
          snapping: 'none',
          children: jsx('span', {
            id: 'remix-caller-layout-box-child',
            children: 'Caller layout',
          }),
        }),
      }),
      jsx('section', {
        id: 'remix-baseline-paint-parity',
        children: [
          { name: 'line', base: 8, variant: 'line', color: undefined },
          { name: 'flat', base: 8, variant: 'flat', color: '#283c50' },
          {
            name: 'fractional',
            base: 4.5,
            variant: 'line',
            color: '#123456',
          },
        ].flatMap(({ name, base, variant, color }) => [
          jsx(Config, {
            domDiagnostics: true,
            children: jsx('div', {
              id: `remix-baseline-reference-${name}`,
              style: { position: 'relative', width: 320, height: 32 },
              children: jsx(Baseline, {
                id: `remix-baseline-reference-host-${name}`,
                debugging: 'visible',
                base,
                variant,
                color,
                width: '100%',
                height: '100%',
              }),
            }),
          }),
          jsx(Config, {
            domDiagnostics: false,
            children: jsx('div', {
              id: `remix-baseline-compact-${name}`,
              style: { position: 'relative', width: 320, height: 32 },
              children: jsx(Baseline, {
                id: `remix-baseline-compact-host-${name}`,
                debugging: 'visible',
                base,
                variant,
                color,
                width: '100%',
                height: '100%',
              }),
            }),
          }),
        ]),
      }),
      jsx('section', {
        id: 'remix-baseline-viewport',
        style: { position: 'relative', width: 320, height: 160 },
        children: jsx(Baseline, {
          debugging: 'visible',
          base: 8,
          width: '100%',
          height: '100vh',
        }),
      }),
      jsx('section', {
        id: 'remix-baseline-parent-resize',
        style: { position: 'relative', width: 320, height: 160 },
        children: jsx(Baseline, {
          debugging: 'visible',
          base: 8,
          width: '100%',
          height: '100%',
        }),
      }),
      jsx('section', {
        id: 'remix-baseline-virtual-tall',
        style: { position: 'relative', width: 320, height: 8000 },
        children: jsx(Baseline, {
          debugging: 'visible',
          base: 8,
          width: '100%',
          height: 8000,
        }),
      }),
      jsx('section', {
        id: 'remix-dimension-matrix',
        style: { fontSize: 16 },
        children: dimensionMatrix,
      }),
      jsx(Config, {
        baseline: {
          debugging: 'visible',
          colors: { line: '#101010', flat: '#202020' },
        },
        children: jsx('div', {
          id: 'remix-config-baseline',
          style: { position: 'relative', height: 16 },
          children: jsx(Baseline, {
            debugging: 'visible',
            base: 8,
            width: '100%',
            height: 16,
          }),
        }),
      }),
      jsx(Config, {
        baseline: {
          debugging: 'visible',
          colors: { line: '#101010', flat: '#202020' },
        },
        children: jsx('div', {
          id: 'remix-config-baseline-inline',
          style: { position: 'relative', height: 16 },
          children: jsx(Baseline, {
            debugging: 'visible',
            base: 8,
            width: '100%',
            height: 16,
            style: { '--bkbl-cl': 'rgb(1, 2, 3)' },
          }),
        }),
      }),
      jsx(Config, {
        guide: {
          debugging: 'visible',
          variant: 'fixed',
          colors: {
            line: '#303030',
            pattern: '#404040',
            auto: '#505050',
            fixed: '#606060',
          },
        },
        children: jsx('div', {
          id: 'remix-config-guide',
          style: { position: 'relative', width: 320, height: 160 },
          children: jsx(Guide, {
            variant: 'fixed',
            columns: 4,
            debugging: 'visible',
          }),
        }),
      }),
      jsx(Config, {
        guide: {
          debugging: 'visible',
          variant: 'fixed',
          colors: {
            line: '#303030',
            pattern: '#404040',
            auto: '#505050',
            fixed: '#606060',
          },
        },
        children: jsx('div', {
          id: 'remix-config-guide-inline',
          style: { position: 'relative', width: 320, height: 160 },
          children: jsx(Guide, {
            variant: 'fixed',
            columns: 4,
            debugging: 'visible',
            style: { '--bkgd-cf': 'rgb(1, 2, 3)' },
          }),
        }),
      }),
      jsx(Config, {
        padder: { debugging: 'visible', color: '#707070' },
        children: jsx('div', {
          id: 'remix-config-padder',
          children: jsx(Padder, {
            debugging: 'visible',
            block: [8, 8],
            children: 'Native Padder consumer',
          }),
        }),
      }),
      jsx(Config, {
        box: {
          debugging: 'visible',
          colors: { line: '#ff0000', flat: '#00ff00', text: '#0000ff' },
        },
        padder: { debugging: 'visible', color: '#707070' },
        spacer: {
          debugging: 'visible',
          colors: { line: '#ff0000', flat: '#00ff00', text: '#0000ff' },
        },
        children: [
          jsx('div', {
            id: 'remix-config-box',
            children: jsx(Box, { children: 'Native Box consumer' }),
          }),
          jsx('div', {
            id: 'remix-config-spacer',
            children: jsx(Spacer, {
              height: 16,
              variant: 'flat',
            }),
          }),
        ],
      }),
      jsx('div', {
        id: 'remix-snap-box',
        children: jsx(Box, {
          snapping: 'height',
          block: [0, 0],
          children: jsx('div', {
            style: { height: 10 },
            children: 'Native snapping consumer',
          }),
        }),
      }),
      jsx('div', {
        id: 'remix-snap-box-top',
        children: jsx(Box, {
          snapping: 'height',
          snapEdge: 'top',
          debugging: 'visible',
          block: [0, 0],
          children: jsx('div', {
            style: { height: 10 },
            children: 'Native top snap consumer',
          }),
        }),
      }),
      jsx('section', {
        id: 'remix-caller-css',
        children: [
          jsx('style', { children: '.caller-flex { display: flex; }' }),
          jsx(Box, {
            id: 'remix-caller-class-box',
            className: 'caller-flex',
            children: 'Caller class',
          }),
          jsx(Box, {
            id: 'remix-trim-box',
            debugging: 'none',
            children: jsx('p', { style: { margin: 0 }, children: 'Box child' }),
          }),
          jsx(Padder, {
            id: 'remix-trim-padder',
            debugging: 'hidden',
            children: jsx('p', {
              style: { margin: 0 },
              children: 'Padder child',
            }),
          }),
          jsx(Padder, {
            id: 'remix-trim-padder-none',
            debugging: 'none',
            children: jsx('p', {
              style: { margin: 0 },
              children: 'Padder child',
            }),
          }),
        ],
      }),
      jsx('div', {
        id: 'remix-detach-host',
        style: { position: 'relative', width: '400px', height: '20px' },
        children: jsx(Guide, {
          variant: 'auto',
          columnWidth: 100,
          debugging: 'visible',
        }),
      }),
      jsx('section', {
        id: 'remix-nested-snap',
        style: { display: 'flow-root' },
        children: [
          jsx(Box, {
            id: 'remix-nested-snap-outer',
            children: jsx(Box, {
              children: 'Sphinx of black quartz, judge my vow',
            }),
          }),
          jsx(Box, { as: 'p', children: 'Semantic paragraph one' }),
          jsx(Box, { as: 'p', children: 'Semantic paragraph two' }),
          jsx(Box, { children: jsx(Spacer, { height: 12 }) }),
        ],
      }),
      jsx('section', {
        id: 'remix-snap-probes',
        children: [jsx(SnapModeProbe, {}), jsx(LiveGridProbe, {})],
      }),
      jsx('section', {
        id: 'remix-late-and-margins',
        children: [
          jsx('style', {
            children: 'p { margin: 1em 0; } .caller-mt { margin-top: 16px; }',
          }),
          jsx(Box, {
            id: 'remix-late-box',
            snapping: 'height',
            block: [0, 0],
            children: jsx('div', {
              id: 'remix-late-content',
              style: { height: '10px' },
            }),
          }),
          jsx(Box, {
            id: 'remix-reset-p',
            as: 'p',
            children: 'Element margin',
          }),
          jsx(Box, {
            id: 'remix-caller-p',
            as: 'p',
            className: 'caller-mt',
            children: 'Caller margin',
          }),
        ],
      }),
      jsx('section', {
        id: 'remix-precision',
        children: [
          jsx('div', {
            style: { zoom: 1.25 },
            children: jsx(Box, {
              id: 'remix-precision-zoom',
              snapping: 'height',
              block: [0, 0],
              children: jsx('div', { style: { height: '10.5px' } }),
            }),
          }),
          jsx(Box, {
            id: 'remix-precision-unit',
            snapping: 'height',
            block: [0, 0],
            children: jsx('div', { style: { height: '8.015625px' } }),
          }),
        ],
      }),
      jsx('section', {
        id: 'remix-grid-exact',
        children: [
          jsx(Padder, {
            id: 'remix-grid-padder',
            debugging: 'hidden',
            block: [8, 8],
            children: jsx('div', { style: { height: '8.296875px' } }),
          }),
          jsx(Box, {
            id: 'remix-nested-outer',
            snapping: 'none',
            children: jsx(Box, {
              id: 'remix-nested-inner',
              snapping: 'height',
              snapEdge: 'top',
              block: [0, 0],
              children: jsx('div', { style: { height: '10.5px' } }),
            }),
          }),
        ],
      }),
      jsx('div', {
        id: 'remix-snap-box-top-fractional',
        children: jsx(Box, {
          snapping: 'height',
          snapEdge: 'top',
          debugging: 'visible',
          block: [0, 0],
          children: jsx('div', {
            style: { height: '10.5px' },
            children: 'Native fractional top snap consumer',
          }),
        }),
      }),
      jsx('section', {
        id: 'remix-box-semantic-host',
        children: [
          jsx(Box, {
            id: 'remix-semantic-heading',
            as: 'h2',
            snapping: 'height',
            snapEdge: 'top',
            debugging: 'visible',
            style: { display: 'flex' },
            block: [0, 0],
            children: 'Semantic host heading',
          }),
          jsx(Box, {
            id: 'remix-semantic-label',
            as: 'label',
            htmlFor: 'remix-semantic-input',
            children: 'Semantic host label',
          }),
          jsx('input', { id: 'remix-semantic-input' }),
          jsx('div', {
            style: { width: '400px' },
            children: jsx(Box, {
              id: 'remix-semantic-sized',
              as: 'h3',
              width: '50%',
              snapping: 'height',
              snapEdge: 'top',
              block: [0, 0],
              style: { borderBottom: '1px solid', paddingTop: '3px' },
              children: 'Sized semantic heading',
            }),
          }),
        ],
      }),
    ],
  })

  return jsx(Config, { domDiagnostics: true, children: app })
}
