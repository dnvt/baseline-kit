// tests/hooks/useGuide.test.ts
import { renderHook } from '@testing-library/react'
import * as measurementModule from '@/hooks/useMeasure'
import { useGuide } from '@hooks'

describe('useGuide', () => {
  let useMeasureSpy: any

  beforeEach(() => {
    useMeasureSpy = vi.spyOn(measurementModule, 'useMeasure')
  })

  it('handles line variant with known width', () => {
    useMeasureSpy.mockReturnValue({ width: 100, height: 50 })
    const ref = { current: document.createElement('div') }
    const { result } = renderHook(() =>
      useGuide(ref, {
        variant: 'line',
        gap: 8,
        base: 8,
      }),
    )
    // e.g. "repeat(12, 1px)" should be part of the template, and isValid=true
    expect(result.current.template).toMatch(/repeat/)
    expect(result.current.isValid).toBe(true)
  })

  it('pattern variant success', () => {
    useMeasureSpy.mockReturnValue({ width: 400, height: 200 })
    const ref = { current: document.createElement('div') }

    const { result } = renderHook(() =>
      useGuide(ref, {
        variant: 'pattern',
        columns: ['10px', '2fr', 'auto'],
        gap: 4,
      }),
    )

    expect(result.current.template).toBe('10px 2fr auto')
    expect(result.current.isValid).toBe(true)
  })

  it('auto variant calculates columns count', () => {
    useMeasureSpy.mockReturnValue({ width: 400, height: 200 })
    const ref = { current: document.createElement('div') }

    const { result } = renderHook(() =>
      useGuide(ref, {
        variant: 'auto',
        columnWidth: 100,
        gap: 8,
      }),
    )
    // For a container width of 400, with a columnWidth of 100 and gap=8,
    // the calculation should yield a valid configuration with "auto-fit" in the template.
    expect(result.current.isValid).toBe(true)
    expect(result.current.template).toContain('auto-fit')
  })

  it('returns isValid=false if container width=0', () => {
    useMeasureSpy.mockReturnValue({ width: 0, height: 50 })
    const ref = { current: document.createElement('div') }

    const { result } = renderHook(() =>
      useGuide(ref, { variant: 'line' }),
    )
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
      }),
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
      }),
    )
    expect(result.current.isValid).toBe(true)
    expect(result.current.template).toMatch(/repeat/)
  })
})