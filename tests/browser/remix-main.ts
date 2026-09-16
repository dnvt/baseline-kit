import { run } from 'remix/ui'
import { jsx } from 'remix/ui/jsx-runtime'
import { Baseline, Box, Config, Spacer } from '@baseline-kit/remix'
import { createRemixApp } from './remix-app'

function createLifecycleFrame(src: string) {
  const version = new URL(src, document.baseURI).pathname.endsWith('-b')
    ? 'b'
    : 'a'
  const color = version === 'a' ? '#d11' : '#146c94'

  return [
    jsx(
      'section',
      {
        id: `remix-frame-view-${version}`,
        'data-remix-frame-view': version,
        style: { position: 'relative', width: 320, height: 160 },
        children: jsx(Config, {
          baseline: {
            debugging: 'visible',
            colors: { line: color, flat: color },
          },
          children: [
            jsx('p', {
              id: `remix-frame-label-${version}`,
              children: `Enhanced frame ${version}`,
            }),
            jsx(Baseline, {
              debugging: 'visible',
              base: 8,
              width: '100%',
              height: '100%',
            }),
            jsx(Box, {
              snapping: 'none',
              debugging: 'visible',
              children: `Frame ${version} box`,
            }),
            jsx(Spacer, {
              variant: 'flat',
              debugging: 'visible',
              height: 16,
            }),
          ],
        }),
      },
      version
    ),
  ]
}

const runtime = run({
  loadModule: async (moduleUrl, exportName) => {
    // Exercise out-of-order entry hydration deterministically in regressions.
    if (new URLSearchParams(location.search).get('delayEntry') === exportName) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    const module = await import(
      /* @vite-ignore */ new URL(moduleUrl, document.baseURI).href
    )
    const component = module[exportName as keyof typeof module]
    if (typeof component !== 'function') {
      throw new Error(
        `Native fixture export "${moduleUrl}#${exportName}" is missing`
      )
    }
    const loaded =
      (window as unknown as { __baselineRemixLoadedModules?: string[] })
        .__baselineRemixLoadedModules ?? []
    loaded.push(`${moduleUrl}#${exportName}`)
    ;(
      window as unknown as { __baselineRemixLoadedModules: string[] }
    ).__baselineRemixLoadedModules = loaded
    return component
  },
  resolveFrame: async (src, options) => {
    const pathname = new URL(src, document.baseURI).pathname
    if (pathname.startsWith('/remix-lifecycle-')) {
      return createLifecycleFrame(src)
    }
    if (pathname === '/remix.html') {
      return createRemixApp()
    }
    return fetch(src, { signal: options?.signal })
  },
})

;(
  window as unknown as { __baselineRemixRuntime: typeof runtime }
).__baselineRemixRuntime = runtime
;(
  window as unknown as { __baselineRemixReady?: Promise<void> }
).__baselineRemixReady = runtime.ready().then(() => {
  const frame = runtime.frames.get('lifecycle')
  if (!frame) throw new Error('Native lifecycle frame was not registered')

  ;(
    window as unknown as {
      __baselineRemixLifecycle: {
        reload: (src: string) => Promise<void>
        replace: (src: string) => Promise<void>
        replaceStatic: () => Promise<void>
      }
    }
  ).__baselineRemixLifecycle = {
    async reload(src) {
      frame.src = new URL(src, document.baseURI).href
      await frame.reload()
      runtime.flush()
    },
    async replace(src) {
      frame.src = new URL(src, document.baseURI).href
      await frame.replace(createLifecycleFrame(frame.src))
      runtime.flush()
    },
    async replaceStatic() {
      await frame.replace(
        jsx('p', {
          id: 'remix-frame-static',
          children: 'Static replacement content',
        })
      )
      runtime.flush()
    },
  }
})
