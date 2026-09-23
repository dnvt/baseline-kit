import { renderToString } from 'remix/ui/server'
import { jsx } from 'remix/ui/jsx-runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  Baseline,
  Box,
  Config,
  Guide,
  Padder,
  Spacer,
} from '@baseline-kit/remix'

describe('Remix adapter', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders native components through Remix SSR without React', async () => {
    const Probe = (handle: Parameters<typeof Config>[0]) => () => {
      const value = handle.context.get(Config) as
        { baseline?: { debugging?: string } } | undefined
      return jsx('output', {
        'data-config': value?.baseline?.debugging ?? 'missing',
      })
    }

    const probeHtml = await renderToString(
      jsx(Config, {
        baseline: { debugging: 'visible' },
        children: jsx(Probe, {}),
      })
    )
    expect(probeHtml).toContain('data-config="visible"')

    const html = await renderToString(
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
          jsx(Baseline, { base: 8, height: 160, width: '100%' }),
          jsx(Box, { children: 'Box content' }),
          jsx(Spacer, { variant: 'flat', height: 16 }),
          jsx(Padder, { block: [8, 8], children: 'Padded content' }),
          jsx(Guide, {
            variant: 'fixed',
            columns: 4,
            debugging: 'visible',
          }),
        ],
      })
    )

    expect(html).toContain('data-testid="baseline"')
    expect(html).toContain('--bkbl-cl: #ff0000')
    expect(html).toContain('data-testid="box"')
    expect(html).toContain('--bkbx-cl: #112233')
    expect(html).toContain('data-testid="spacer"')
    expect(html).toContain('--bksp-cf: #556677')
    expect(html).toContain('data-testid="padder"')
    expect(html).toContain('data-testid="guide"')
  })

  it('omits generated DOM diagnostics by default and preserves caller attributes', async () => {
    const defaultHtml = await renderToString(
      jsx(Spacer, {
        height: 24,
        'data-user-probe': 'kept',
        'aria-label': 'sample spacer',
      })
    )
    expect(defaultHtml).not.toContain('data-testid="spacer"')
    expect(defaultHtml).not.toContain('data-variant=')
    expect(defaultHtml).not.toContain('data-height=')
    expect(defaultHtml).toContain('data-user-probe="kept"')
    expect(defaultHtml).toContain('aria-label="sample spacer"')

    const enabledHtml = await renderToString(
      jsx(Config, {
        domDiagnostics: true,
        children: jsx(Spacer, { height: 24 }),
      })
    )
    expect(enabledHtml).toContain('data-testid="spacer"')
    expect(enabledHtml).toContain('data-variant="line"')
    expect(enabledHtml).toContain('data-height="24px"')
  })

  it('keeps ssrMode as a permanent non-measuring fallback', async () => {
    const baselineHtml = await renderToString(
      jsx(Baseline, {
        ssrMode: true,
        debugging: 'visible',
        width: 120,
        height: 80,
        base: 8,
      })
    )
    expect(baselineHtml).toContain('class="bk-bas bk-h bk-ssr bk-line"')
    expect(baselineHtml).not.toContain('data-row-index')
    expect(baselineHtml).toContain('width: 120px')
    expect(baselineHtml).toContain('height: 80px')

    const guideHtml = await renderToString(
      jsx(Guide, {
        ssrMode: true,
        debugging: 'visible',
        width: 120,
        height: 80,
        children: 'SSR guide content',
      })
    )
    expect(guideHtml).toContain('class="bk-gde bk-h bk-ssr bk-line"')
    expect(guideHtml).toContain('SSR guide content')
  })
})
