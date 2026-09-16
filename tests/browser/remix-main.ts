import { run } from 'remix/ui'

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
})

;(
  window as unknown as { __baselineRemixRuntime: typeof runtime }
).__baselineRemixRuntime = runtime
;(
  window as unknown as { __baselineRemixReady?: Promise<void> }
).__baselineRemixReady = runtime.ready().then(() => undefined)
