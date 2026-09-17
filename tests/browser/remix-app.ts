import { Frame } from 'remix/ui'
import { jsx } from 'remix/ui/jsx-runtime'
import { Forwarder } from './remix-entries'
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

export function createRemixApp() {
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

  return jsx('main', {
    children: [
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
        id: 'remix-padder-snap',
        children: jsx(Padder, {
          debugging: 'none',
          children: jsx('div', { style: { width: 20, height: 10 } }),
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
    ],
  })
}
