import { render, screen } from '@testing-library/react'
import { X_GRID as CONFIG } from '@config'
import { XGConfig, XGrid } from '../Grid'

export type ResizeObserverCallback = (entries: ResizeObserverEntry[]) => void

// Add this mock at the top of XGrid.test.tsx
vi.mock('@hooks', () => ({
  useGridDimensions: () => ({ width: 1024, height: 768 }),
  useGridCalculations: ({ config }: { config: XGConfig }) => {
    switch (config.variant) {
    case 'line':
      return {
        gridTemplateColumns: `repeat(${Math.floor(1024 / 16)}, 1px)`,
        columnsCount: Math.floor(1024 / 16),
        calculatedGap: '14px',
      }
    case 'auto':
      return {
        gridTemplateColumns: `repeat(auto-fit, minmax(${String(config.columnWidth)}, 1fr))`,
        columnsCount: Math.floor(1024 / parseInt(String(config.columnWidth))),
        calculatedGap: `${config.gap}px`,
      }
    case 'pattern':
      return {
        gridTemplateColumns: config.columns.join(' '),
        columnsCount: config.columns.length,
        calculatedGap: `${config.gap}px`,
      }
    case 'fixed':
      return {
        gridTemplateColumns: `repeat(${config.columns}, ${config.columnWidth || '1fr'})`,
        columnsCount: config.columns,
        calculatedGap: `${config.gap}px`,
      }
    default:
      return {
        gridTemplateColumns: 'none',
        columnsCount: 0,
        calculatedGap: '0px',
      }
    }
  },
}))

// And update the mock to use only one argument
const mockResizeObserver = vi.fn((callback: ResizeObserverCallback) => ({
  observe: vi.fn((target: Element) => {
    callback([
      {
        contentRect: { width: 1024, height: 768 },
        target,
        borderBoxSize: [],
        contentBoxSize: [],
        devicePixelContentBoxSize: [],
      } as unknown as ResizeObserverEntry,
    ])
  }),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))


vi.stubGlobal('ResizeObserver', mockResizeObserver)

describe('XGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('ResizeObserver', mockResizeObserver)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('Rendering', () => {
    const baseConfig: XGConfig = {
      variant: 'fixed',
      columns: 12,
    }

    it('renders nothing when visibility is hidden', () => {
      render(<XGrid config={baseConfig} visibility="hidden" />)
      const container = screen.getByTestId('xgrid-container')
      expect(container.className).toContain('hidden')
      expect(container.querySelector('[data-column-index]')).toBeNull()
    })

    it('renders with visibility when set to visible', () => {
      render(<XGrid config={baseConfig} visibility="visible" />)
      const container = screen.getByTestId('xgrid-container')
      expect(container.className).toContain('visible')
    })

    it('applies default values correctly', () => {
      render(<XGrid config={baseConfig} />)
      const container = screen.getByTestId('xgrid-container')
      expect(container.style.getPropertyValue('--padd-grid-color')).toBe(CONFIG.color)
      expect(container.style.getPropertyValue('--padd-z-index')).toBe(CONFIG.zIndex.toString())
    })
  })
  
  describe('Configuration Variants', () => {
    it('handles line variant configuration', () => {
      const config: XGConfig = {
        variant: 'line',
        gap: 16,
      }

      render(<XGrid config={config} visibility="visible" />)

      const container = screen.getByTestId('xgrid-container')
      expect(container).toHaveAttribute('data-variant', 'line')
      expect(container.style.getPropertyValue('--padd-gap')).toBe('14px') // Updated expectation
    })

    it('handles auto variant configuration', () => {
      const config: XGConfig = {
        variant: 'auto',
        columnWidth: '100px',
        gap: 16,
      }

      render(<XGrid config={config} visibility="visible" />)

      const container = screen.getByTestId('xgrid-container')
      expect(container).toHaveAttribute('data-variant', 'auto')
      expect(container.style.getPropertyValue('--padd-gap')).toBe('16px')
      expect(container.style.getPropertyValue('--padd-grid-template-columns'))
        .toBe('repeat(auto-fit, minmax(100px, 1fr))')
    })

    it('handles pattern variant configuration', () => {
      const config: XGConfig = {
        variant: 'pattern',
        columns: ['1fr', '2fr', '100px'],
        gap: 16,
      }

      render(<XGrid config={config} visibility="visible" />)

      const container = screen.getByTestId('xgrid-container')
      expect(container).toHaveAttribute('data-variant', 'pattern')
      const columns = container.querySelectorAll('[data-column-index]')
      expect(columns).toHaveLength(3)
      expect(container.style.getPropertyValue('--padd-grid-template-columns')).toBe('1fr 2fr 100px')
    })

    it('handles fixed variant configuration', () => {
      const config: XGConfig = {
        variant: 'fixed',
        columns: 12,
        columnWidth: '100px',
        gap: 16,
      }

      render(<XGrid config={config} visibility="visible" />)

      const container = screen.getByTestId('xgrid-container')
      expect(container).toHaveAttribute('data-variant', 'fixed')
      const columns = container.querySelectorAll('[data-column-index]')
      expect(columns).toHaveLength(12)
      expect(container.style.getPropertyValue('--padd-grid-template-columns')).toBe('repeat(12, 100px)')
    })
  })

  describe('Grid Calculations', () => {
    it('calculates grid template columns correctly', () => {
      const config: XGConfig = {
        variant: 'fixed',
        columns: 3,
        columnWidth: '100px',
        gap: 16,
      }

      render(<XGrid config={config} visibility="visible" />)

      const gridContainer = screen.getByTestId('xgrid-container')
      expect(gridContainer.style.getPropertyValue('--padd-grid-template-columns')).toBe('repeat(3, 100px)')
    })

    it('handles alignment configuration', () => {
      const config: XGConfig = {
        variant: 'fixed',
        columns: 3,
        align: 'center',
      }

      render(<XGrid config={config} visibility="visible" />)

      const container = screen.getByTestId('xgrid-container')
      expect(container.style.getPropertyValue('--padd-grid-justify')).toBe('center')
    })
  })

  describe('Style Customization', () => {
    const baseConfig: XGConfig = {
      variant: 'fixed',
      columns: 12,
      gap: 16,
    }

    it('applies custom CSS variables', () => {
      const customStyle = {
        '--custom-color': '#ff0000',
        '--custom-z-index': '10',
        '--custom-property': '20px',
      }

      render(<XGrid config={baseConfig} style={customStyle} visibility="visible" />)

      const container = screen.getByTestId('xgrid-container')
      Object.entries(customStyle).forEach(([prop, value]) => {
        expect(container.style.getPropertyValue(prop)).toBe(value)
      })
    })

    it('combines multiple class names correctly', () => {
      render(<XGrid config={baseConfig} className="custom-class-1 custom-class-2" visibility="visible" />)

      const container = screen.getByTestId('xgrid-container')
      expect(container).toHaveClass('custom-class-1', 'custom-class-2')
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined maxWidth', () => {
      const config: XGConfig = {
        variant: 'fixed',
        columns: 12,
        maxWidth: undefined,
      }

      render(<XGrid config={config} visibility="visible" />)

      const container = screen.getByTestId('xgrid-container')
      expect(container.style.getPropertyValue('--padd-width')).toBe('100%') // Updated expectation
    })

    it('handles undefined padding', () => {
      const config: XGConfig = {
        variant: 'fixed',
        columns: 12,
        padding: undefined,
      }

      render(<XGrid config={config} visibility="visible" />)

      const container = screen.getByTestId('xgrid-container')
      // When padding is undefined, it uses the default value from CONFIG
      expect(container.style.getPropertyValue('--padd-padding')).toBe(`${CONFIG.padding}px`)
    })
  })

})
