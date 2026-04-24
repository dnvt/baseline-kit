import { createVirtualTracker } from '@baseline-kit/dom/virtual'

const createElement = () => {
  const el = document.createElement('div')
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 100,
    bottom: 100,
    width: 100,
    height: 100,
    toJSON: () => ({}),
  } as DOMRect)
  return el
}

describe('createVirtualTracker', () => {
  it('rejects non-positive item heights', () => {
    const el = createElement()

    expect(() =>
      createVirtualTracker(el, { totalItems: 10, itemHeight: 0 }, vi.fn())
    ).toThrow('itemHeight')
    expect(() =>
      createVirtualTracker(el, { totalItems: 10, itemHeight: -1 }, vi.fn())
    ).toThrow('itemHeight')
  })

  it('rejects negative total item counts', () => {
    expect(() =>
      createVirtualTracker(
        createElement(),
        { totalItems: -1, itemHeight: 20 },
        vi.fn()
      )
    ).toThrow('totalItems')
  })

  it('uses passive window listeners', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const handle = createVirtualTracker(
      createElement(),
      { totalItems: 10, itemHeight: 20 },
      vi.fn()
    )
    handle.disconnect()

    expect(addSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
      expect.objectContaining({ passive: true })
    )
    expect(addSpy).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
      expect.objectContaining({ passive: true })
    )
    expect(removeSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
      expect.objectContaining({ passive: true })
    )
    expect(removeSpy).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
      expect.objectContaining({ passive: true })
    )
  })
})
