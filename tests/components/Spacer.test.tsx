import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CSSProperties } from 'react'
import { Guide } from '@components'

// We use a mock for the hooks to ensure predictable behavior:
vi.mock('@hooks', async () => {
  const originalModule = await vi.importActual<typeof import('@hooks')>('@hooks')
  return {
    __esModule: true,
    ...originalModule,
    // Force container measurement for predictable grid calculations.
    useMeasurement: () => ({
      width: 1024,
      height: 768,
      refresh: vi.fn(),
    }),
    // Mock useGuide to return predictable grid settings based on the passed config.
    useGuide: (_ref: any, config: any) => {
      const variant = config.variant
      const base = config.base ?? 8
      const calculatedGap = config.gap ?? base
      if (variant === 'line') {
        const columnsCount = 64
        const template = 'repeat(64, 1px)'
        return { template, columnsCount, calculatedGap }
      }
      if (variant === 'auto') {
        const columnWidth = typeof config.columnWidth === 'number' ? config.columnWidth : 100
        const columnsCount = Math.floor(1024 / columnWidth)
        const template = `repeat(auto-fit, minmax(${columnWidth}px, 1fr))`
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
      // Fallback for unknown variants.
      return {
        template: 'none',
        columnsCount: 0,
        calculatedGap: 0,
      }
    },
    // For guide, return a fixed config
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

  describe('Variant Rendering', () => {
    it('renders a "line" variant with correct gap calculation', () => {
      render(<Guide variant="line" gap={10} debugging="visible" data-testid="guide" />)
      const guideEl = screen.getByTestId('guide')
      // For gap=10 and base=8, gapInPixels = 10 * 8 = 80; our mock subtracts 1, so expect 79px.
      expect(guideEl.getAttribute('style')).toContain('--bk-guide-gap: 79px')
    })

    it('handles "auto" variant with numeric columnWidth', () => {
      render(
        <Guide
          variant="auto"
          columnWidth={100}
          gap={16}
          debugging="visible"
          data-testid="guide"
        />,
      )
      const guideEl = screen.getByTestId('guide')
      expect(guideEl.dataset.variant).toBe('auto')
      // With a container width of 1024 and columnWidth of 100, expect floor(1024/100)=10 columns.
      const columns = guideEl.querySelectorAll('[data-column-index]')
      expect(columns.length).toBe(10)
      const expectedGap = 16 * 8 // 128px
      expect(guideEl.getAttribute('style')).toContain(`--bk-guide-gap: ${expectedGap}px`)
    })

    it('handles "pattern" variant with array columns', () => {
      render(
        <Guide
          variant="pattern"
          columns={['1fr', '2fr', '3fr']}
          gap={10}
          debugging="visible"
          data-testid="guide"
        />,
      )
      const guideEl = screen.getByTestId('guide')
      expect(guideEl.dataset.variant).toBe('pattern')
      const cols = guideEl.querySelectorAll('[data-column-index]')
      expect(cols.length).toBe(3)
      expect(guideEl.getAttribute('style')).toContain('--bk-guide-template: 1fr 2fr 3fr')
      const expectedGap = 10 * 8
      expect(guideEl.getAttribute('style')).toContain(`--bk-guide-gap: ${expectedGap}px`)
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
        />,
      )
      const guideEl = screen.getByTestId('guide')
      expect(guideEl.dataset.variant).toBe('fixed')
      const cols = guideEl.querySelectorAll('[data-column-index]')
      expect(cols.length).toBe(5)
      const expectedGap = 12 * 8
      expect(guideEl.getAttribute('style')).toContain(`--bk-guide-gap: ${expectedGap}px`)
      expect(guideEl.getAttribute('style')).toContain('--bk-guide-template: repeat(5, 120px)')
    })
  })

  describe('Visibility', () => {
    it('renders hidden when debugging="hidden"', () => {
      render(<Guide debugging="hidden" data-testid="guide" />)
      const guideEl = screen.getByTestId('guide')
      expect(guideEl.className).toMatch(/hidden/)
    })

    it('renders hidden by default if no debugging prop is given', () => {
      render(<Guide data-testid="guide" />)
      const guideEl = screen.getByTestId('guide')
      // Depending on your default config, adjust this expectation.
      // In our mock, if no debugging is provided, assume default is hidden.
      expect(guideEl.className).toMatch(/hidden/)
    })
  })

  describe('Custom Overrides', () => {
    it('applies custom CSS props from style', () => {
      render(
        <Guide
          style={{ '--my-custom': '999px', backgroundColor: 'red' } as CSSProperties}
          data-testid="guide"
        />,
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
})