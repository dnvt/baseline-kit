import { createMeasureObserver } from '@baseline-kit/dom/measure'

describe('createMeasureObserver', () => {
  it('keeps fractional heights and rounds widths', () => {
    const el = document.createElement('div')
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
      width: 120.4,
      height: 8.734375,
    } as DOMRect)
    const onChange = vi.fn()

    const handle = createMeasureObserver(el, onChange)

    expect(onChange).toHaveBeenCalledWith({ width: 120, height: 8.734375 })
    handle.disconnect()
  })
})

describe('createMeasureObserver without ResizeObserver', () => {
  it('measures once and disconnects cleanly', () => {
    const original = globalThis.ResizeObserver
    // @ts-expect-error simulate an environment without ResizeObserver
    delete globalThis.ResizeObserver
    try {
      const el = document.createElement('div')
      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
        width: 10,
        height: 20,
      } as DOMRect)
      const onChange = vi.fn()
      const handle = createMeasureObserver(el, onChange)
      expect(onChange).toHaveBeenCalledWith({ width: 10, height: 20 })
      expect(() => handle.disconnect()).not.toThrow()
    } finally {
      globalThis.ResizeObserver = original
    }
  })
})

describe('onSnapSettleEvent', () => {
  // A FontFaceSet stub: one shared `ready` promise per load.
  function stubFonts(status: 'loaded' | 'loading') {
    const fonts = new EventTarget() as EventTarget & {
      ready: Promise<void>
      status: string
      finish: (ok?: boolean) => void
    }
    let settle: (ok: boolean) => void = () => {}
    const load = () => {
      fonts.ready = new Promise<void>((resolve, reject) => {
        settle = (ok) => (ok ? resolve() : reject(new Error('stub')))
      })
      fonts.ready.catch(() => {})
    }
    fonts.status = status
    if (status === 'loading') load()
    else fonts.ready = Promise.resolve()
    fonts.addEventListener('loading', () => {
      if (fonts.status === 'loading') return
      fonts.status = 'loading'
      load()
    })
    fonts.finish = (ok = true) => {
      fonts.status = 'loaded'
      settle(ok)
    }
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: fonts,
    })
    return fonts
  }
  const flush = () => new Promise((resolve) => setTimeout(resolve, 0))
  const load = async () => {
    vi.resetModules()
    return (await import('@baseline-kit/dom/measure')).onSnapSettleEvent
  }

  afterEach(() => {
    // @ts-expect-error remove the stub
    delete document.fonts
  })

  it('notifies once per font load, when it finishes', async () => {
    const fonts = stubFonts('loaded')
    const onSnapSettleEvent = await load()
    const listener = vi.fn()
    const unsubscribe = onSnapSettleEvent(listener)

    // WebKit fires `loading` and never `loadingdone`.
    fonts.dispatchEvent(new Event('loading'))
    fonts.dispatchEvent(new Event('loading'))
    await flush()
    expect(listener).not.toHaveBeenCalled()
    fonts.finish()
    await flush()
    expect(listener).toHaveBeenCalledTimes(1)

    unsubscribe()
    fonts.dispatchEvent(new Event('loading'))
    fonts.finish()
    await flush()
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('catches a font load that started before the first listener', async () => {
    const fonts = stubFonts('loading')
    const onSnapSettleEvent = await load()
    const listener = vi.fn()
    onSnapSettleEvent(listener)
    fonts.finish()
    await flush()
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('keeps listening after a rejected ready promise', async () => {
    const fonts = stubFonts('loaded')
    const onSnapSettleEvent = await load()
    const listener = vi.fn()
    onSnapSettleEvent(listener)
    fonts.dispatchEvent(new Event('loading'))
    fonts.finish(false)
    await flush()
    fonts.dispatchEvent(new Event('loading'))
    fonts.finish()
    await flush()
    expect(listener).toHaveBeenCalledTimes(2)
  })
})
