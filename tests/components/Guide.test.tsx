import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom' // For .toBeInTheDocument, etc.
import { Guide } from '@components'

vi.mock('@hooks', async () => {
  const originalModule = await vi.importActual<typeof import('@hooks')>('@hooks')

  return {
    __esModule: true,
    ...originalModule,

    // We force the container to measure 1024×768
    useGuideDimensions: () => ({
      width: 1024,
      height: 768,
    }),

    // A minimal mock that returns the passed gap as `--pdd-guide-gap: XXpx`
    // plus a little variant logic for columns & template.
    useGuideCalculations: ({ config }: any) => {
      // If the user did not pass config.gap, default to "8px"
      const gap = config.gap ?? 1
      const variant = config.variant

      if (variant === 'line') {
        // e.g. 64 columns of 1px each
        return {
          gridTemplateColumns: 'repeat(64,1px)',
          columnsCount: 64,
          calculatedGap: gap,
        }
      }
      if (variant === 'auto') {
        // e.g. container=1024 => columnWidth=100 => columns=10
        const cw = typeof config.columnWidth === 'number' ? config.columnWidth : 100
        const count = Math.floor(1024 / cw)
        return {
          gridTemplateColumns: `repeat(auto-fit, minmax(${cw}px, 1fr))`,
          columnsCount: count,
          calculatedGap: gap,
        }
      }
      if (variant === 'pattern') {
        // e.g. columns=[ '1fr','2fr','3fr' ]
        const arr = Array.isArray(config.columns) ? config.columns : []
        return {
          gridTemplateColumns: arr.join(' '),
          columnsCount: arr.length,
          calculatedGap: gap,
        }
      }
      if (variant === 'fixed') {
        // e.g. columns=5 => "repeat(5, 120px)"
        const c = typeof config.columns === 'number' ? config.columns : 3
        const cw = config.columnWidth ?? '1fr'
        return {
          gridTemplateColumns: `repeat(${c}, ${cw})`,
          columnsCount: c,
          calculatedGap: gap,
        }
      }

      // fallback
      return {
        gridTemplateColumns: 'none',
        columnsCount: 0,
        calculatedGap: 0,
      }
    },

    // Make the guide config "visible" by default
    // and define minimal colors for each variant
    useConfig: (component: string) => {
      if (component === 'guide') {
        return {
          base: 8,
          variant: 'line',    // default
          visibility: 'visible',
          colors: {
            line: 'rgba(255,0,0,0.3)',
            pattern: 'rgba(0,255,0,0.3)',
            auto: 'rgba(0,0,255,0.3)',
            fixed: 'rgba(255,255,0,0.3)',
          },
        }
      }
      // If other components also call useConfig
      // just return something minimal
      return {}
    },

    // If your Guide uses useNormalizedDimensions
    useNormalizedDimensions: () => ({
      width: 'auto',
      height: 'auto',
      normalizedWidth: 800,
      normalizedHeight: 600,
      cssProps: {
        '--dimension-width': 'auto',
        '--dimension-height': 'auto',
      },
      dimensions: {
        width: 'auto',
        height: 'auto',
      },
    }),
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
    expect(styleAttr).toContain(`--pdd-guide-gap: ${expectedGap}px`)
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

  it('renders hidden when visibility="hidden"', () => {
    render(<Guide debugging="hidden" data-testid="guide" />)
    const guideEl = screen.getByTestId('guide')
    // If the final hashed class is something like '_hidden_9f4983'
    // we just check substring
    expect(guideEl.className).toMatch(/hidden/)
  })

  it('renders visible by default if no visibility prop is given', () => {
    render(<Guide data-testid="guide" />)
    const guideEl = screen.getByTestId('guide')
    // Our partial mock says default is 'visible' => so check substring
    expect(guideEl.className).toMatch(/visible/)
  })


  it('applies custom CSS props from style', () => {
    render(
      <Guide
        style={{
          '--my-custom': '999px',
          backgroundColor: 'red',
        } as React.CSSProperties}
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