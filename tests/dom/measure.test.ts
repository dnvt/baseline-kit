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
