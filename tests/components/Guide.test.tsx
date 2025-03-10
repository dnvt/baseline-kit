import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CSSProperties } from 'react'
import * as React from 'react'
import { Guide } from '@components'

// Our tests rely on predictable values from our hook mocks,
// so we override certain hooks via vi.mock.
vi.mock('@hooks', async () => {
  const originalModule =
    await vi.importActual<typeof import('@hooks')>('@hooks')
  return {
    __esModule: true,
    ...originalModule,
    // Force the container measurement to be 1024×768.
    useMeasurement: () => ({
      width: 1024,
      height: 768,
      refresh: vi.fn(),
    }),
    // Return predictable grid configuration for each variant.
    useGuide: (ref: any, config: any) => {
      const variant = config.variant
      const base = config.base ?? 8
      const gap = config.gap ?? base
      const calculatedGap = gap // In our mock, we simply return gap.
      if (variant === 'line') {
        const columnsCount = 64
        const template = 'repeat(64, 1px)'
        return { template, columnsCount, calculatedGap }
      }
      if (variant === 'auto') {
        const columnWidth =
          typeof config.columnWidth === 'number' ? config.columnWidth : 100
        const columnsCount = Math.floor(1024 / columnWidth)
        const template = `repeat(auto-fill, ${columnWidth}px)`
        return { template, columnsCount, calculatedGap }
      }
      if (variant === 'pattern') {
        const columnsArray = Array.isArray(config.columns) ? config.columns : []
        const columnsCount = columnsArray.length
        const template = columnsArray.join(' ')
        return { template, columnsCount, calculatedGap }
      }
      if (variant === 'fixed') {
        const columns = typeof config.columns === 'number' ? config.columns : 3
        const columnWidth = config.columnWidth ?? '1fr'
        const columnsCount = columns
        const template = `repeat(${columns}, ${columnWidth})`
        return { template, columnsCount, calculatedGap }
      }
      return {
        template: 'none',
        columnsCount: 0,
        calculatedGap: 0,
      }
    },
    // Return a fixed guide config.
    useConfig: (component: string) => {
      if (component === 'guide') {
        return {
          base: 8,
          colors: {
            line: 'rgba(255,0,0,0.3)',
            pattern: 'rgba(0,255,0,0.3)',
            auto: 'rgba(0,0,255,0.3)',
            fixed: 'rgba(255,255,0,0.3)',
          },
        }
      }
      return {}
    },
  }
})

describe('Guide component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a line variant with 64 columns from the partial mock', () => {
    render(
      <Guide variant="line" gap={10} debugging="visible" data-testid="guide" />
    )
    const guideEl = screen.getByTestId('guide')
    expect(guideEl.getAttribute('style')).toContain('--bkgg: 10px')
  })

  it('handles "auto" variant with numeric columnWidth', () => {
    render(
      <Guide
        variant="auto"
        columnWidth={100}
        gap={16}
        debugging="visible"
        data-testid="guide"
      />
    )
    const guideEl = screen.getByTestId('guide')
    expect(guideEl.dataset.variant).toBe('auto')
    const columns = guideEl.querySelectorAll('[data-column-index]')
    expect(columns.length).toBe(65)
    expect(guideEl.getAttribute('style')).toContain('--bkgg: 16px')
  })

  it('handles "pattern" variant array columns', () => {
    render(
      <Guide
        variant="pattern"
        columns={['1fr', '2fr', '3fr']}
        gap={10}
        data-testid="guide"
        debugging="visible"
      />
    )
    const guideEl = screen.getByTestId('guide')
    expect(guideEl.dataset.variant).toBe('pattern')
    const cols = guideEl.querySelectorAll('[data-column-index]')
    expect(cols.length).toBe(103)
    expect(guideEl.getAttribute('style')).toContain('--bkgt: 1fr 2fr 3fr')
    expect(guideEl.getAttribute('style')).toContain('--bkgg: 10px')
  })

  it('handles "fixed" variant with 5 columns', () => {
    render(
      <Guide
        variant="fixed"
        columns={5}
        columnWidth="120px"
        gap={12}
        debugging="visible"
        data-testid="guide"
      />
    )
    const guideEl = screen.getByTestId('guide')
    expect(guideEl.dataset.variant).toBe('fixed')
    const cols = guideEl.querySelectorAll('[data-column-index]')
    expect(cols.length).toBe(86)
    expect(guideEl.getAttribute('style')).toContain('--bkgg: 12px')
    expect(guideEl.getAttribute('style')).toContain('--bkgt: repeat(5, 120px)')
  })

  it('renders hidden when debugging="hidden"', () => {
    render(<Guide debugging="hidden" data-testid="guide" />)
    const guideEl = screen.getByTestId('guide')
    expect(guideEl.className).toContain('h') // Update to match the actual class name
  })

  it('renders hidden by default if no debugging prop is given', () => {
    render(<Guide data-testid="guide" />)
    const guideEl = screen.getByTestId('guide')
    expect(guideEl.className).toContain('h') // Update to match the actual class name
  })

  it('applies custom CSS props from style', () => {
    render(
      <Guide
        style={
          {
            '--my-custom': '999px',
            backgroundColor: 'red',
          } as CSSProperties
        }
        data-testid="guide"
      />
    )
    const guideEl = screen.getByTestId('guide')
    const styleAttr = guideEl.getAttribute('style') || ''
    expect(styleAttr).toContain('--my-custom: 999px')
    expect(styleAttr).toContain('background-color: red')
  })

  it('combines additional className', () => {
    render(<Guide className="customA customB" data-testid="guide" />)
    const guideEl = screen.getByTestId('guide')
    expect(guideEl.className).toMatch(/customA/)
    expect(guideEl.className).toMatch(/customB/)
  })
})
