import { renderHook } from '@testing-library/react'
import * as measurementModule from '@baseline-kit/react/hooks/useMeasure'
import { useBaseline } from '@baseline-kit/react/hooks'

describe('useBaseline', () => {
  let useMeasureSpy: any

  beforeEach(() => {
    useMeasureSpy = vi.spyOn(measurementModule, 'useMeasure')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the original spacing if snapping="none" (object input)', () => {
    useMeasureSpy.mockReturnValue({ width: 100, height: 42 })
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() =>
      useBaseline(ref, {
        base: 8,
        snapping: 'none',
        spacing: { top: 10, bottom: 10, left: 5, right: 5 },
      })
    )
    expect(result.current.padding).toEqual({
      top: 10,
      bottom: 10,
      left: 5,
      right: 5,
    })
    expect(result.current.isAligned).toBe(false) // 42 % 8 = 2, not aligned
  })

  it('returns the original spacing if snapping="none" (number input)', () => {
    useMeasureSpy.mockReturnValue({ width: 100, height: 42 })
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() =>
      useBaseline(ref, {
        base: 8,
        snapping: 'none',
        spacing: 15,
      })
    )
    expect(result.current.padding).toEqual({
      top: 15,
      right: 15,
      bottom: 15,
      left: 15,
    })
  })

  it('returns zero spacing when no spacing props are provided', () => {
    useMeasureSpy.mockReturnValue({ width: 100, height: 42 })
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() =>
      useBaseline(ref, { base: 8, snapping: 'none' })
    )
    expect(result.current.padding).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    })
  })

  it('adjusts bottom padding for "height" mode', () => {
    // Measured height = 46 => remainder = 6, diff = 2, so bottom: 10 + 2 = 12.
    useMeasureSpy.mockReturnValue({ width: 100, height: 46 })
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() =>
      useBaseline(ref, {
        base: 8,
        snapping: 'height',
        spacing: { top: 10, bottom: 10, left: 0, right: 0 },
      })
    )
    expect(result.current.padding.bottom).toBe(12)
    expect(result.current.isAligned).toBe(false)
  })

  it('adjusts top padding when snapEdge is "top"', () => {
    useMeasureSpy.mockReturnValue({ width: 100, height: 46 })
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() =>
      useBaseline(ref, {
        base: 8,
        snapping: 'height',
        snapEdge: 'top',
        spacing: { top: 10, bottom: 10, left: 0, right: 0 },
      })
    )
    expect(result.current.padding).toEqual({
      top: 12,
      right: 0,
      bottom: 10,
      left: 0,
    })
  })

  it('clamps top & bottom in "clamp" mode', () => {
    // For height=45: remainder = 5, diff = 3.
    // With spacing { top: 10, bottom: 6, left: 0, right: 0 }:
    // top becomes: 10 % 8 = 2,
    // bottom becomes: (6 + 3) % 8 = 9 % 8 = 1.
    useMeasureSpy.mockReturnValue({ width: 100, height: 45 })
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() =>
      useBaseline(ref, {
        base: 8,
        snapping: 'clamp',
        spacing: { top: 10, bottom: 6, left: 0, right: 0 },
      })
    )
    expect(result.current.padding).toEqual({
      top: 2,
      right: 0,
      bottom: 1,
      left: 0,
    })
  })

  it('isAligned=true if measured height is exactly multiple of base', () => {
    useMeasureSpy.mockReturnValue({ width: 100, height: 48 })
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() =>
      useBaseline(ref, { base: 8, snapping: 'height', spacing: {} })
    )
    expect(result.current.isAligned).toBe(true)
    expect(result.current.height).toBe(48)
  })

  it('throws if base < 1', () => {
    useMeasureSpy.mockReturnValue({ width: 100, height: 50 })
    const ref = { current: document.createElement('div') }
    expect(() =>
      renderHook(() =>
        useBaseline(ref, {
          base: 0,
          snapping: 'height',
        })
      )
    ).toThrow()
  })

  it('reports misalignment via isAligned when height does not match base', () => {
    useMeasureSpy.mockReturnValue({ width: 100, height: 42 }) // 42 % 8 = 2, not aligned.
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() =>
      useBaseline(ref, {
        base: 8,
        snapping: 'none',
        spacing: { top: 1, bottom: 1, left: 1, right: 1 },
      })
    )
    expect(result.current.isAligned).toBe(false)
  })

  it('snaps on the first non-zero measurement (regression: latch was poisoned by height=0)', () => {
    // Simulate the real flow: useMeasure returns 0 on first render, then
    // settles to the actual measured height after the ResizeObserver fires.
    useMeasureSpy.mockReturnValueOnce({ width: 100, height: 0 })
    useMeasureSpy.mockReturnValue({ width: 100, height: 46 })
    const ref = { current: document.createElement('div') }
    const { result, rerender } = renderHook(() =>
      useBaseline(ref, {
        base: 8,
        snapping: 'height',
        spacing: { top: 10, bottom: 10, left: 0, right: 0 },
      })
    )
    // First render: no measurement yet, return raw spacing.
    expect(result.current.padding.bottom).toBe(10)

    // Second render with a real measurement: snap should happen.
    rerender()
    expect(result.current.padding.bottom).toBe(12)
  })

  it('re-snaps from the natural height while the content settles', () => {
    useMeasureSpy.mockReturnValue({ width: 100, height: 46 })
    const ref = { current: document.createElement('div') }
    const { result, rerender } = renderHook(() =>
      useBaseline(ref, {
        base: 8,
        snapping: 'height',
        spacing: { top: 10, bottom: 10, left: 0, right: 0 },
      })
    )
    expect(result.current.padding.bottom).toBe(12)

    // The DOM now includes the 2px correction: no change, no re-snap.
    useMeasureSpy.mockReturnValue({ width: 100, height: 48 })
    rerender()
    expect(result.current.padding.bottom).toBe(12)

    // A web font swap grows the content by 3px: the natural height becomes
    // 49, so the correction becomes 7px.
    useMeasureSpy.mockReturnValue({ width: 100, height: 51 })
    rerender()
    expect(result.current.padding.bottom).toBe(17)
  })

  it('returns the explicit padding again when snapping turns off', () => {
    useMeasureSpy.mockReturnValue({ width: 100, height: 46 })
    const ref = { current: document.createElement('div') }
    const { result, rerender } = renderHook(
      ({ snapping }: { snapping: 'height' | 'none' }) =>
        useBaseline(ref, {
          base: 8,
          snapping,
          spacing: { top: 10, bottom: 10, left: 0, right: 0 },
        }),
      { initialProps: { snapping: 'height' } }
    )
    expect(result.current.padding.bottom).toBe(12)
    rerender({ snapping: 'none' })
    expect(result.current.padding.bottom).toBe(10)
  })

  it('snaps afresh when snapping turns off and back on', () => {
    vi.useFakeTimers()
    try {
      // 48 is on the grid: the snap keeps the explicit padding.
      useMeasureSpy.mockReturnValue({ width: 100, height: 48 })
      const ref = { current: document.createElement('div') }
      const { result, rerender } = renderHook(
        ({ snapping }: { snapping: 'height' | 'none' }) =>
          useBaseline(ref, {
            base: 8,
            snapping,
            spacing: { top: 10, bottom: 10, left: 0, right: 0 },
          }),
        { initialProps: { snapping: 'height' } }
      )
      expect(result.current.padding.bottom).toBe(10)
      vi.advanceTimersByTime(2000)

      // The content grows while snapping is off; switching back must not
      // reuse the old snap.
      rerender({ snapping: 'none' })
      useMeasureSpy.mockReturnValue({ width: 100, height: 51 })
      rerender({ snapping: 'none' })
      rerender({ snapping: 'height' })
      expect(result.current.padding.bottom).toBe(15)
    } finally {
      vi.useRealTimers()
    }
  })

  it('keeps the snap once the settle window has passed', () => {
    vi.useFakeTimers()
    try {
      useMeasureSpy.mockReturnValue({ width: 100, height: 46 })
      const ref = { current: document.createElement('div') }
      const { result, rerender } = renderHook(() =>
        useBaseline(ref, {
          base: 8,
          snapping: 'height',
          spacing: { top: 10, bottom: 10, left: 0, right: 0 },
        })
      )
      expect(result.current.padding.bottom).toBe(12)

      vi.advanceTimersByTime(2000)
      useMeasureSpy.mockReturnValue({ width: 100, height: 53 })
      rerender()
      expect(result.current.padding.bottom).toBe(12)
    } finally {
      vi.useRealTimers()
    }
  })
})
