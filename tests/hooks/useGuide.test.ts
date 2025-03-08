import { renderHook } from '@testing-library/react'
import * as measurementModule from '@/hooks/useMeasure'
import { useGuide } from '@hooks'

describe('useGuide', () => {
  let useMeasureSpy: any

  beforeEach(() => {
    useMeasureSpy = vi.spyOn(measurementModule, 'useMeasure')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('handles line variant with known width', () => {
    useMeasureSpy.mockReturnValue({ width: 100, height: 50 })
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() =>
      useGuide(ref, {
        variant: 'line',
        gap: 8,
        base: 8,
      })
    )
    expect(result.current.template).toMatch(/repeat/)
    expect(result.current.columnsCount).toBe(13)
    expect(result.current.isValid).toBe(true)
    expect(result.current.calculatedGap).toBe(7)
  })

  it('pattern variant success', () => {
    useMeasureSpy.mockReturnValue({ width: 400, height: 200 })
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() =>
      useGuide(ref, {
        variant: 'pattern',
        columns: ['10px', '2fr', 'auto'],
        gap: 4,
      })
    )
    expect(result.current.template).toBe('10px 2fr auto')
    expect(result.current.isValid).toBe(true)
  })

  it('auto variant calculates columns count with numeric columnWidth', () => {
    useMeasureSpy.mockReturnValue({ width: 400, height: 200 })
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() =>
      useGuide(ref, {
        variant: 'auto',
        columnWidth: 100,
        gap: 8,
      })
    )
    expect(result.current.template).toBe('repeat(auto-fit, minmax(100px, 1fr))')
    expect(result.current.columnsCount).toBe(3)
    expect(result.current.calculatedGap).toBe(8)
    expect(result.current.isValid).toBe(true)
  })

  it('auto variant returns default template when columnWidth is "auto"', () => {
    useMeasureSpy.mockReturnValue({ width: 500, height: 200 })
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() =>
      useGuide(ref, {
        variant: 'auto',
        columnWidth: 'auto',
        gap: 10,
      })
    )
    expect(result.current.template).toBe('repeat(auto-fit, minmax(0, 1fr))')
    expect(result.current.columnsCount).toBe(1)
    expect(result.current.isValid).toBe(true)
  })

  it('fixed variant calculates template correctly', () => {
    useMeasureSpy.mockReturnValue({ width: 400, height: 200 })
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() =>
      useGuide(ref, {
        variant: 'fixed',
        columns: 3,
        columnWidth: 100,
        gap: 8,
      })
    )
    expect(result.current.template).toBe('repeat(3, 100px)')
    expect(result.current.columnsCount).toBe(3)
    expect(result.current.calculatedGap).toBe(8)
    expect(result.current.isValid).toBe(true)
  })

  it('returns an invalid config for fixed variant if columns count is less than 1', () => {
    useMeasureSpy.mockReturnValue({ width: 500, height: 200 })
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() =>
      useGuide(ref, {
        variant: 'fixed',
        columns: 0,
        gap: 10,
      })
    )
    expect(result.current.isValid).toBe(false)
    expect(result.current.template).toBe('none')
  })

  it('returns isValid=false if container width=0', () => {
    useMeasureSpy.mockReturnValue({ width: 0, height: 50 })
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() => useGuide(ref, { variant: 'line' }))
    expect(result.current.isValid).toBe(false)
    expect(result.current.template).toBe('none')
  })

  it('handles invalid pattern => isValid=false', () => {
    useMeasureSpy.mockReturnValue({ width: 300, height: 100 })
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() =>
      useGuide(ref, {
        variant: 'pattern',
        columns: ['0px', 'auto'],
        gap: 4,
      })
    )
    expect(result.current.isValid).toBe(false)
    expect(result.current.template).toBe('none')
  })

  it('falls back to line if variant is unknown', () => {
    useMeasureSpy.mockReturnValue({ width: 100, height: 50 })
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() =>
      useGuide(ref, {
        variant: 'other' as any,
      })
    )
    expect(result.current.isValid).toBe(true)
    expect(result.current.template).toMatch(/repeat/)
  })

  it('handles line variant with gap=0', () => {
    useMeasureSpy.mockReturnValue({ width: 100, height: 50 })
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() =>
      useGuide(ref, {
        variant: 'line',
        gap: 0,
        base: 8,
      })
    )
    expect(result.current.template).toMatch(/repeat/)
    expect(result.current.columnsCount).toBe(101)
    expect(result.current.isValid).toBe(true)
    expect(result.current.calculatedGap).toBe(0)
  })
})
