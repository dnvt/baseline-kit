import {
  createMeasureObserver,
  getRenderedBlockPadding,
} from '@baseline-kit/dom/measure'

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

describe('getRenderedBlockPadding', () => {
  // jsdom computes no grid tracks, so resolved styles come from a stub.
  const resolved = new Map<Element, Partial<CSSStyleDeclaration>>()
  beforeEach(() => {
    resolved.clear()
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      (element) =>
        ({
          gridTemplateRows: 'none',
          paddingTop: '0px',
          paddingBottom: '0px',
          ...resolved.get(element),
        }) as CSSStyleDeclaration
    )
  })
  afterEach(() => vi.restoreAllMocks())

  const build = (html: string) => {
    const root = document.createElement('div')
    root.innerHTML = html
    return root.firstElementChild as HTMLElement
  }

  it('reads the tracks of a Box drawn on its own grid', () => {
    const host = build(
      '<div class="bk-box"><div class="bk-pad-content"></div></div>'
    )
    resolved.set(host, { gridTemplateRows: '5px 13px 3px', paddingTop: '9px' })
    // The host's own padding (a caller's) is not snap padding.
    expect(getRenderedBlockPadding(host)).toEqual({ top: 5, bottom: 3 })
  })

  it('reads the inner grid of a semantic Box', () => {
    const host = build(
      '<h3 class="bk-box"><span class="bk-box__grid"><span class="bk-pad-content"></span></span></h3>'
    )
    resolved.set(host.firstElementChild!, {
      gridTemplateRows: '2.5px 20px 0px',
    })
    expect(getRenderedBlockPadding(host)).toEqual({ top: 2.5, bottom: 0 })
  })

  it("adds an inner Padder's inline padding when it draws no spacers", () => {
    const host = build(
      '<div class="bk-box"><div class="bk-pad bk-pad-plain" style="padding-block: 4px 6px"><div class="bk-pad-content"></div></div></div>'
    )
    resolved.set(host.firstElementChild!, {
      gridTemplateRows: '0px 21px 0px',
      paddingTop: '4px',
      paddingBottom: '6px',
    })
    expect(getRenderedBlockPadding(host)).toEqual({ top: 4, bottom: 6 })
  })

  it("reads a Padder's own padding, not a nested Box's", () => {
    const host = build(
      '<div class="bk-pad bk-pad-plain" style="padding-block: 0px 5px"><div class="bk-box"><div class="bk-pad-content"></div></div></div>'
    )
    resolved.set(host, { paddingTop: '0px', paddingBottom: '5px' })
    resolved.set(host.firstElementChild!, { gridTemplateRows: '7px 9px 1px' })
    expect(getRenderedBlockPadding(host)).toEqual({ top: 0, bottom: 5 })
  })

  it('reads a plain Padder animating toward no padding', () => {
    // At a zero target the inline padding is gone, but the CSS padding is
    // still on its way down.
    const host = build('<div class="bk-pad bk-pad-plain"></div>')
    resolved.set(host, { paddingTop: '0px', paddingBottom: '2.5px' })
    expect(getRenderedBlockPadding(host)).toEqual({ top: 0, bottom: 2.5 })
  })

  it("ignores a caller's inline padding on a Padder that draws spacers", () => {
    const host = build(
      '<div class="bk-pad" style="padding-block: 4px"><div class="bk-pad-content"></div></div>'
    )
    resolved.set(host, {
      gridTemplateRows: '0px 12px 3px',
      paddingTop: '4px',
      paddingBottom: '4px',
    })
    expect(getRenderedBlockPadding(host)).toEqual({ top: 0, bottom: 3 })
  })

  it('ignores padding on a Padder that draws spacers', () => {
    const host = build(
      '<div class="bk-pad"><div class="bk-pad-top"></div><div class="bk-pad-content"></div></div>'
    )
    resolved.set(host, {
      gridTemplateRows: '6px 12px 0px',
      paddingTop: '10px',
    })
    expect(getRenderedBlockPadding(host)).toEqual({ top: 6, bottom: 0 })
  })
})
