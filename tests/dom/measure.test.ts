import {
  createMeasureObserver,
  getCSSZoom,
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
          borderTopWidth: '0px',
          borderBottomWidth: '0px',
          marginTop: '0px',
          marginBottom: '0px',
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

  const place = (element: Element, top: number, bottom: number) =>
    vi
      .spyOn(element, 'getBoundingClientRect')
      .mockReturnValue({ top, bottom, height: bottom - top } as DOMRect)

  it('reads the content margins of a Box drawn on its own grid', () => {
    const host = build(
      '<div class="bk-box"><div class="bk-pad-content"></div></div>'
    )
    const content = host.firstElementChild!
    resolved.set(host, { paddingTop: '9px' })
    resolved.set(content, { marginTop: '5.3px', marginBottom: '3px' })
    // Layout rounds the margin to its own units: the offsets are what it
    // used. The host's own padding (a caller's) is not snap padding.
    place(host, 100, 133)
    place(content, 114.296875, 130)
    expect(getRenderedBlockPadding(host)).toEqual({
      top: 5.296875,
      bottom: 3,
    })
  })

  it('keeps the computed margins of content that overflows its Box', () => {
    const host = build(
      '<div class="bk-box"><div class="bk-pad-content"></div></div>'
    )
    const content = host.firstElementChild!
    resolved.set(content, { marginTop: '5px', marginBottom: '3px' })
    place(host, 0, 40)
    place(content, 5, 60)
    expect(getRenderedBlockPadding(host)).toEqual({ top: 5, bottom: 3 })
  })

  it('reads the content margins in the inner grid of a semantic Box', () => {
    const host = build(
      '<h3 class="bk-box"><span class="bk-box__grid"><span class="bk-pad-content"></span></span></h3>'
    )
    resolved.set(host.firstElementChild!.firstElementChild!, {
      marginTop: '2.5px',
      marginBottom: '0px',
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

  it("reads a spacer Padder's content margins, not a caller's padding", () => {
    const host = build(
      '<div class="bk-pad bk-pad-hosted" style="padding-block: 4px"><div class="bk-pad-top"></div><div class="bk-pad-content"></div></div>'
    )
    const content = host.querySelector('.bk-pad-content')!
    resolved.set(host, { paddingTop: '4px', paddingBottom: '4px' })
    resolved.set(content, { marginTop: '6px', marginBottom: '3px' })
    place(host, 0, 29)
    place(content, 10, 22)
    expect(getRenderedBlockPadding(host)).toEqual({ top: 6, bottom: 3 })
  })

  it("reads a separate-Padder Box's inner spacer Padder", () => {
    const host = build(
      '<div class="bk-box"><div class="bk-pad bk-pad-hosted"><div class="bk-pad-content"></div></div></div>'
    )
    resolved.set(host.querySelector('.bk-pad-content')!, {
      marginTop: '0px',
      marginBottom: '2.5px',
    })
    expect(getRenderedBlockPadding(host)).toEqual({ top: 0, bottom: 2.5 })
  })
})

describe('getCSSZoom', () => {
  afterEach(() => vi.restoreAllMocks())

  it('multiplies each ancestor zoom where currentCSSZoom is missing', () => {
    // WebKit on Linux has no currentCSSZoom.
    const outer = document.createElement('div')
    const middle = document.createElement('div')
    const inner = document.createElement('div')
    outer.append(middle)
    middle.append(inner)
    const zooms = new Map<Element, string>([
      [outer, '1.25'],
      [middle, '2'],
    ])
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      (element) => ({ zoom: zooms.get(element) ?? '1' }) as CSSStyleDeclaration
    )
    expect(getCSSZoom(inner)).toBe(2.5)
  })

  it('uses currentCSSZoom where it exists', () => {
    const element = document.createElement('div')
    Object.defineProperty(element, 'currentCSSZoom', { value: 1.5 })
    expect(getCSSZoom(element)).toBe(1.5)
  })
})
