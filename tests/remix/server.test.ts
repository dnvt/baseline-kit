import { describe, expect, it, vi } from 'vitest'
import { clientEntry, Frame, type Handle, type RemixNode } from 'remix/ui'
import { jsx } from 'remix/ui/jsx-runtime'
import { Config, Spacer } from '@baseline-kit/remix'
import { DEFAULT_CONFIG } from '@baseline-kit/core'
import type { ConfigSchema } from '@baseline-kit/core'
import {
  ImportMap,
  renderToStream,
  renderToString,
} from '@baseline-kit/remix/server'
import { renderToString as upstreamRenderToString } from 'remix/ui/server'

describe('Node Remix SSR compatibility entry', () => {
  it('defaults old Config snapshots without domDiagnostics to false', async () => {
    const legacySnapshot = { ...DEFAULT_CONFIG } as Partial<ConfigSchema>
    delete legacySnapshot.domDiagnostics

    const html = await renderToString(
      jsx(Spacer, {
        height: 24,
        debugging: 'visible',
        'data-caller': 'preserved',
        __baselineConfig: legacySnapshot as ConfigSchema,
      } as never)
    )

    expect(html).not.toContain('data-testid="spacer"')
    expect(html).not.toContain('data-height=')
    expect(html).toContain('data-caller="preserved"')
  })

  it('prefers an independent entry snapshot over a different live ancestor', () => {
    const snapshot = { ...DEFAULT_CONFIG, base: 4 }
    const ancestor = { ...DEFAULT_CONFIG, base: 12 }
    const render = Spacer({
      props: { height: 16, __baselineConfig: snapshot },
      context: { get: () => ancestor },
    } as unknown as Parameters<typeof Spacer>[0])
    const element = render() as { props: { __baselineConfig: unknown } }
    expect(element.props.__baselineConfig).toBe(snapshot)
  })
  it('preserves nested provider scope in serialized children and sibling slots', async () => {
    const Forwarder = clientEntry(
      '/app.js#Forwarder',
      (handle: Handle) => () =>
        jsx('div', { children: handle.props.children as RemixNode })
    )
    const Generated = () => () =>
      jsx(Spacer, { height: 16, debugging: 'visible' })
    const html = await renderToString(
      jsx(Config, {
        domDiagnostics: true,
        base: 12,
        spacer: { colors: { line: 'red' } },
        children: jsx(Forwarder, {
          children: [
            jsx(Config, {
              base: 4,
              spacer: { colors: { line: 'blue' } },
              children: jsx(Generated, {}),
            }),
            jsx(Generated, {}),
          ],
        }),
      })
    )
    const json = html.match(
      /<script type="application\/json" id="rmx-data">(.*?)<\/script>/s
    )?.[1]
    expect(json).toBeDefined()
    const entries = Object.values(JSON.parse(json!).h) as Array<{
      exportName: string
      props: { children: Array<{ props: Record<string, unknown> }> }
    }>
    const entry = entries.find((entry) => entry.exportName === 'Forwarder')!
    expect(
      entry.props.children.map(({ props }) => [
        props['data-height'],
        (props.style as Record<string, unknown>)['--bksp-cl'],
      ])
    ).toEqual([
      ['16px', 'blue'],
      ['12px', 'red'],
    ])
  })

  it('keeps upstream Frame identity and the compatibility ImportMap identity', async () => {
    const html = await new Response(
      renderToStream(
        jsx('html', {
          children: [
            jsx('head', {
              children: jsx(ImportMap, {
                value: { imports: { example: '/example.js' } },
              }),
            }),
            jsx('body', { children: jsx(Frame, { src: '/child' }) }),
          ],
        }),
        { resolveFrame: () => '<p>Frame resolved</p>' }
      )
    ).text()
    expect(html).toContain('"example":"/example.js"')
    expect(html).toContain('Frame resolved')
  })

  it('does not replace the original renderer exports', () => {
    expect(renderToString).not.toBe(upstreamRenderToString)
  })

  it('fails closed if the installed server source is changed', async () => {
    vi.doMock('node:fs/promises', async () => {
      const actual =
        await vi.importActual<typeof import('node:fs/promises')>(
          'node:fs/promises'
        )
      const readFile = async () => 'modified source'
      return { ...actual, readFile, default: { ...actual, readFile } }
    })
    vi.resetModules()
    try {
      await expect(import('@baseline-kit/remix/server')).rejects.toThrow(
        'requires the unmodified @remix-run/ui@0.9.0 renderer'
      )
    } finally {
      vi.doUnmock('node:fs/promises')
      vi.resetModules()
    }
  })
})
