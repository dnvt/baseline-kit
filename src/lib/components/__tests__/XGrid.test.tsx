import { render, screen } from '@testing-library/react'
import { GRID } from '@config'
import { XGrid } from '../Grid'

// Mock ResizeObserver
const mockResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
vi.stubGlobal('ResizeObserver', mockResizeObserver)

describe('XGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders nothing when visibility is hidden', () => {
      render(<XGrid config={{ columns: 12 }} visibility="hidden" />)
      const container = screen.getByTestId('xgrid-container')
      expect(container).toHavePartialClassName('_hidden')
    })

    it('renders with visibility when set to visible', () => {
      render(<XGrid config={{ columns: 12 }} visibility="visible" />)
      const container = screen.getByTestId('xgrid-container')
      expect(container).toHavePartialClassName('_visible')
    })

    it('applies default values correctly', () => {
      render(<XGrid config={{ columns: 12 }} />)
      const container = screen.getByTestId('xgrid-container')

      const style = container.style
      expect(style.getPropertyValue('--grid-column-color')).toBe(GRID.defaults.colors.xGrid)
      expect(style.getPropertyValue('--grid-z-index')).toBe(GRID.defaults.zIndex.toString())
    })
  })

  describe('Configuration Variants', () => {
    it('handles line variant configuration', () => {
      render(
        <XGrid
          config={{
            variant: 'line',
            gap: 16,
          }}
          visibility="visible"
        />,
      )

      const container = screen.getByTestId('xgrid-container')
      expect(container).toHaveAttribute('data-variant', 'line')
      expect(container.querySelectorAll('.lineColumn')).toHaveLength(
        container.querySelectorAll('[data-column-index]').length,
      )
    })
  })

  describe('Style Customization', () => {
    it('applies custom CSS variables', () => {
      const customStyle = {
        '--grid-column-color': '#ff0000',
        '--grid-z-index': '10',
        '--custom-property': '20px',
      }

      render(
        <XGrid
          config={{
            columns: 12,
            gap: 16,
          }}
          style={customStyle}
          visibility="visible"
        />,
      )

      const container = screen.getByTestId('xgrid-container')
      Object.entries(customStyle).forEach(([prop, value]) => {
        expect(container.style.getPropertyValue(prop)).toBe(value)
      })
    })

    it('combines multiple class names correctly', () => {
      render(
        <XGrid
          config={{
            columns: 12,
          }}
          className="custom-class-1 custom-class-2"
          visibility="visible"
        />,
      )

      const container = screen.getByTestId('xgrid-container')
      expect(container).toHaveClass('custom-class-1', 'custom-class-2')
    })
  })

  describe('Error Handling', () => {
    it('handles invalid column configurations gracefully', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {
      })

      render(
        <XGrid
          config={{
            columns: -1, // Invalid column count
            gap: 16,
          }}
          visibility="visible"
        />,
      )

      const container = screen.getByTestId('xgrid-container')
      expect(container.style.getPropertyValue('--grid-template-columns')).toBe('none')
      expect(container.style.getPropertyValue('--grid-gap')).toBe('0px')

      consoleError.mockRestore()
    })

    it('handles missing container width gracefully', () => {
      render(
        <XGrid
          config={{
            columns: 12,
            gap: 16,
          }}
          visibility="visible"
        />,
      )

      const container = screen.getByTestId('xgrid-container')
      expect(container.style.getPropertyValue('--grid-template-columns')).toBe('none')
    })
  })

  describe('Performance Optimizations', () => {
    it('memoizes grid calculations correctly', () => {
      const { rerender } = render(
        <XGrid
          config={{
            columns: 12,
            gap: 16,
          }}
          visibility="visible"
        />,
      )

      const initialContainer = screen.getByTestId('xgrid-container')
      const initialStyles = initialContainer.getAttribute('style')

      // Rerender with same props
      rerender(
        <XGrid
          config={{
            columns: 12,
            gap: 16,
          }}
          visibility="visible"
        />,
      )

      const rerenderedContainer = screen.getByTestId('xgrid-container')
      expect(rerenderedContainer.getAttribute('style')).toBe(initialStyles)
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined maxWidth', () => {
      render(
        <XGrid
          config={{
            columns: 12,
            maxWidth: undefined,
          }}
          visibility="visible"
        />,
      )

      const container = screen.getByTestId('xgrid-container')
      expect(container.style.getPropertyValue('--grid-max-width')).toBe('')
    })

    it('handles undefined padding', () => {
      render(
        <XGrid
          config={{
            columns: 12,
            padding: undefined,
          }}
          visibility="visible"
        />,
      )

      const container = screen.getByTestId('xgrid-container')
      expect(container.style.getPropertyValue('--grid-padding')).toBe('')
    })
  })
})
