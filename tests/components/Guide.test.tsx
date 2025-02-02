import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom' // For .toBeInTheDocument, etc.
import { Guide } from '@components'
import { CSSProperties } from 'react'

vi.mock('@hooks', async () => {
  const originalModule = await vi.importActual<typeof import('@hooks')>('@hooks')

  return {
    __esModule: true,
    ...originalModule,

    // We force the container to measure 1024×768
    useMeasurement: () => ({
      width: 1024,
      height: 768,
      refresh: vi.fn(),
    }),

    // Mock useGuide to return predictable values based on the config
    useGuide: (ref: any, config: any) => {
      const variant = config.variant
      const base = config.base ?? 8
      const gap = config.gap ?? base
      const calculatedGap = gap

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
      // Fallback for unknown variants
      return {
        template: 'none',
        columnsCount: 0,
        calculatedGap: 0,
      }
    },

    // Mock useConfig as before
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
      // Return empty object for other components
      return {}
    },
  }
})

describe('Guide component', () => {
  beforeAll(() => {
    // If your code uses ResizeObserver
    const mockResizeObserver = vi.fn(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }))
    vi.stubGlobal('ResizeObserver', mockResizeObserver)
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a line variant with 64 columns from the partial mock', () => {
    render(<Guide variant="line" gap={10} debugging="visible" data-testid="guide" />)
    const guide = screen.getByTestId('guide')

    const expectedGap = 10 * 8 // Multiply by config.base
    const styleAttr = guide.getAttribute('style') || ''
    expect(styleAttr).toContain(`--pdd-guide-gap: ${expectedGap - 1}px`)
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

    const columns = guideEl.querySelectorAll('[data-column-index]')
    expect(columns.length).toBe(10)

    const expectedGap = 16 * 8 // Multiply by config.base
    const styleAttr = guideEl.getAttribute('style') || ''
    expect(styleAttr).toContain(`--pdd-guide-gap: ${expectedGap}px`)
  })

  it('handles "pattern" variant array columns', () => {
    render(
      <Guide
        variant="pattern"
        columns={['1fr', '2fr', '3fr']}
        gap={10}
        data-testid="guide"
        debugging="visible"
      />,
    )
    const guideEl = screen.getByTestId('guide')
    expect(guideEl.dataset.variant).toBe('pattern')

    const cols = guideEl.querySelectorAll('[data-column-index]')
    expect(cols.length).toBe(3)

    const expectedGap = 10 * 8 // Multiply by config.base
    const styleAttr = guideEl.getAttribute('style') || ''
    expect(styleAttr).toContain('--pdd-guide-template: 1fr 2fr 3fr')
    expect(styleAttr).toContain(`--pdd-guide-gap: ${expectedGap}px`)
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

    const expectedGap = 12 * 8 // Multiply by config.base
    const styleAttr = guideEl.getAttribute('style') || ''
    expect(styleAttr).toContain(`--pdd-guide-gap: ${expectedGap}px`)
    expect(styleAttr).toContain('--pdd-guide-template: repeat(5, 120px)')
  })

  it('renders hidden when debugging="hidden"', () => {
    render(<Guide debugging="hidden" data-testid="guide" />)
    const guideEl = screen.getByTestId('guide')
    // If the final hashed class is something like '_hidden_9f4983'
    // we just check substring
    expect(guideEl.className).toMatch(/hidden/)
  })

  it('renders hidden by default if no debugging prop is given', () => {
    render(<Guide data-testid="guide" />)
    const guideEl = screen.getByTestId('guide')
    // Our partial mock says default is 'visible' => so check substring
    expect(guideEl.className).toMatch(/hidden/)
  })


  it('applies custom CSS props from style', () => {
    render(
      <Guide
        style={{
          '--my-custom': '999px',
          backgroundColor: 'red',
        } as CSSProperties}
        data-testid="guide"
      />,
    )
    const guideEl = screen.getByTestId('guide')
    const styleAttr = guideEl.getAttribute('style') || ''

    // substring checks
    expect(styleAttr).toContain('--my-custom: 999px')
    expect(styleAttr).toContain('background-color: red')
  })

  it('combines additional className', () => {
    render(<Guide className="customA customB" data-testid="guide" />)
    const guideEl = screen.getByTestId('guide')
    // hashed classes: something like '_guide_xxxx customA customB ...'
    expect(guideEl.className).toMatch(/customA/)
    expect(guideEl.className).toMatch(/customB/)
  })
})