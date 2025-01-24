import { useGuideCalculations } from '@hooks'
import { renderHook } from '@testing-library/react'
import { GuideConfig } from '../../src/lib'

describe('useGuideCalculations', () => {
  it('calculates line variant layout correctly', () => {
    // Example: containerWidth=100, gap=8 => we do floor(100 / (8+1))+1 => floor(100/9)+1 => 11+1=12
    // So we expect "repeat(12,1px)" => columns=12 => gap= "8px" => isValid=true
    const config = { variant: 'line', gap: 8 }
    const { result } = renderHook(() =>
      useGuideCalculations({
        containerWidth: 100,
        config,
      }),
    )

    expect(result.current).toEqual({
      gridTemplateColumns: 'repeat(12, 1px)',
      columnsCount: 12,
      calculatedGap: 8,
      isValid: true,
    })
  })

  it('calculates pattern variant with valid columns', () => {
    // e.g. pattern with columns=[ "10px", "2fr", 50, "auto" ], gap=4
    const config = {
      variant: 'pattern' as const,
      columns: ['10px', '2fr', 50, 'auto'],
      gap: 4,
    }
    const { result } = renderHook(() =>
      useGuideCalculations({
        containerWidth: 300,
        config,
      }),
    )

    // columns => [ "10px", "2fr", "50px", "auto" ]
    // isValid => true, because none is '0'
    expect(result.current).toEqual({
      gridTemplateColumns: '10px 2fr 50px auto',
      columnsCount: 4,
      calculatedGap: 4,
      isValid: true,
    })
  })

  it('calculates fixed variant with default columnWidth=1fr', () => {
    // fixed => columns=3 => "repeat(3, 1fr)"
    // gap=8 => "8px", isValid=true
    const config = {
      variant: 'fixed' as const,
      columns: 3,
      gap: 8,
      // no columnWidth => defaults to 1fr
    }
    const { result } = renderHook(() =>
      useGuideCalculations({
        containerWidth: 500,
        config,
      }),
    )

    expect(result.current).toEqual({
      gridTemplateColumns: 'repeat(3, 1fr)',
      columnsCount: 3,
      calculatedGap: 8,
      isValid: true,
    })
  })

  it('calculates auto variant with numeric columnWidth', () => {
    // e.g. containerWidth=400, gap=8 => columnWidth=100 => see how many fit
    // (400+8)/(100+8) => 408/108 => ~3.77 => floor=3 => columns=3
    const config = {
      variant: 'auto' as const,
      columnWidth: 100,
      gap: 8,
    }
    const { result } = renderHook(() =>
      useGuideCalculations({
        containerWidth: 400,
        config,
      }),
    )

    expect(result.current).toEqual({
      gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
      columnsCount: 3,
      calculatedGap: 8,
      isValid: true,
    })
  })

  it('defaults to line config if variant is missing or unknown', () => {
    // your code has a fallback if variant not recognized => line w/ base=someValue gap=8
    // let's say container=100 => line => we do 12 columns
    const config = {
      // no variant property
    } as any
    const { result } = renderHook(() =>
      useGuideCalculations({
        containerWidth: 100,
        config,
      }),
    )

    // By default => line: { base:someValue, gap:8 }, containerWidth=100 => 12 columns
    expect(result.current).toEqual({
      gridTemplateColumns: 'repeat(12, 1px)',
      columnsCount: 12,
      calculatedGap: 8,
      isValid: true,
    })
  })

  it('handles missing container width', () => {
    const config = { variant: 'line' as const }
    const { result } = renderHook(() =>
      useGuideCalculations({
        containerWidth: 0,
        config,
      }),
    )

    // if (!containerWidth), returns { gridTemplateColumns:'none', columnsCount:0, ... }
    expect(result.current).toEqual({
      gridTemplateColumns: 'none',
      columnsCount: 0,
      calculatedGap: 0,
      isValid: false,
    })
  })

  it('handles invalid pattern - none is "0"', () => {
    // e.g. pattern => columns = [ '10px', 'abc' ] => 'abc' => '0'
    // isValid => false => so maybe we do {gridTemplateColumns:'10px 0', columnsCount=2, isValid=false,...}
    const config = {
      variant: 'pattern' as const,
      columns: ['10px', '0px'],
      gap: 4,
    } satisfies GuideConfig

    const { result } = renderHook(() =>
      useGuideCalculations({
        containerWidth: 300,
        config,
      }),
    )

    expect(result.current).toEqual({
      gridTemplateColumns: 'none',
      columnsCount: 0,
      calculatedGap: 0,
      isValid: false,
    })
  })

  it('handles error scenario gracefully', () => {
    // If something throws an error => code returns { gridTemplateColumns:'none', ... isValid:false}
    // For instance, let's forcibly throw in code or pass an edge case
    // Maybe pass a negative columns for fixed => though your code might not do that
    const config = {
      variant: 'fixed',
      columns: -3, // nonsense
      gap: 8,
    } as any

    const { result } = renderHook(() =>
      useGuideCalculations({
        containerWidth: 200,
        config,
      }),
    )

    // Should fallback to the catch => { none, 0, '8px', false }
    expect(result.current).toEqual({
      gridTemplateColumns: 'none',
      columnsCount: 0,
      calculatedGap: 0,
      isValid: false,
    })
  })
})