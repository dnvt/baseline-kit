import { renderToString } from 'baseline-kit/remix/server'
import { jsx } from 'remix/ui/jsx-runtime'
import {
  Baseline,
  Box,
  Config,
  Guide,
  Padder,
  Spacer,
} from 'baseline-kit/remix'

export async function renderFixture() {
  return renderToString(
    jsx(Config, {
      domDiagnostics: true,
      baseline: {
        debugging: 'visible',
        colors: { line: '#ff0000', flat: '#00ff00' },
      },
      box: {
        debugging: 'visible',
        colors: {
          line: '#112233',
          flat: '#223344',
          text: '#334455',
        },
      },
      spacer: {
        debugging: 'visible',
        colors: {
          line: '#445566',
          flat: '#556677',
          text: '#667788',
        },
      },
      children: [
        jsx('p', {
          id: 'packed-remix-content',
          children: 'Packed Remix fixture content.',
        }),
        jsx('section', {
          id: 'packed-remix-baseline',
          style: { position: 'relative', width: 320, height: 160 },
          children: jsx(Baseline, {
            base: 8,
            width: '100%',
            height: '100%',
            debugging: 'visible',
          }),
        }),
        jsx(Box, { children: 'Packed Box content.' }),
        jsx(Spacer, { variant: 'flat', height: 16 }),
        jsx(Padder, { block: [8, 8], children: 'Packed Padder content.' }),
        jsx(Guide, {
          variant: 'fixed',
          columns: 4,
          debugging: 'visible',
        }),
      ],
    })
  )
}
