import { render, screen } from '@testing-library/react'
import { YGrid } from '../Grid'

// Mock IntersectionObserver
const observerMap = new Map()
const mockIntersectionObserver = vi.fn((callback: unknown) => {
  return {
    observe: (element: Element) => {
      observerMap.set(element, callback)
    },
    unobserve: (element: Element) => {
      observerMap.delete(element)
    },
    disconnect: () => {
      observerMap.clear()
    },
  }
})
vi.stubGlobal('IntersectionObserver', mockIntersectionObserver)

// Mock ResizeObserver
const mockResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
vi.stubGlobal('ResizeObserver', mockResizeObserver)

// Helper function to trigger intersection
const triggerIntersection = (
  element: Element,
  isIntersecting = true,
  customRect?: Partial<DOMRect>,
) => {
  const callback = observerMap.get(element)
  if (callback) {
    const defaultRect = {
      top: 0,
      bottom: window.innerHeight,
      height: window.innerHeight,
      width: 100,
      x: 0,
      y: 0,
      left: 0,
      right: 100,
    }

    callback([
      {
        isIntersecting,
        target: element,
        boundingClientRect: { ...defaultRect, ...customRect },
        intersectionRatio: isIntersecting ? 1 : 0,
      },
    ])
  }
}

describe('YGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    observerMap.clear()
  })

  describe('Rendering', () => {
    it('renders nothing when visibility is hidden', () => {
      render(<YGrid config={{}} visibility="hidden" />)
      const container = screen.getByTestId('ygrid-container')
      expect(container as HTMLElement).toHavePartialClassName('hidden')
    })

    it('renders with visibility when set to visible', () => {
      render(<YGrid config={{}} visibility="visible" />)
      const container = screen.getByTestId('ygrid-container')
      expect(container as HTMLElement).toHavePartialClassName('visible')
    })

    it('combines multiple class names correctly', () => {
      render(
        <YGrid
          config={{}}
          className="custom-class-1 custom-class-2"
          visibility="visible"
        />,
      )

      const container = screen.getByTestId('ygrid-container')
      expect(container as HTMLElement).toHavePartialClassName('visible')
      expect(container as HTMLElement).toHavePartialClassName('container')
      expect(container as HTMLElement).toHavePartialClassName('custom-class-1')
    })
  })

  describe('Grid Configuration', () => {
    it('applies custom base unit', () => {
      const { container } = render(
        <YGrid
          config={{
            baseUnit: 16,
            height: 100,
          }}
          visibility="visible"
        />,
      )

      // Trigger intersection for the grid container
      const gridElement = container.firstChild as Element
      triggerIntersection(gridElement)

      const gridContainer = screen.getByTestId('ygrid-container')
      const rows = gridContainer.querySelectorAll('[data-row-index]')

      expect(rows.length).toBeGreaterThan(0)

      const firstRow = rows[0] as HTMLElement
      const secondRow = rows[1] as HTMLElement

      expect(firstRow.style.getPropertyValue('--grid-row-top')).toBe('0px')
      expect(secondRow.style.getPropertyValue('--grid-row-top')).toBe('16px')
    })

    it('handles line variant configuration', () => {
      const { container } = render(
        <YGrid
          config={{
            variant: 'line',
            baseUnit: 8,
            height: 100,
          }}
          visibility="visible"
        />,
      )

      const gridElement = container.firstChild as Element
      triggerIntersection(gridElement)

      const gridContainer = screen.getByTestId('ygrid-container')
      expect(gridContainer).toHaveAttribute('data-variant', 'line')

      const rows = gridContainer.querySelectorAll('[data-row-index]')
      rows.forEach(row => {
        expect((row as HTMLElement).style.getPropertyValue('--grid-row-height')).toBe('1px')
      })
    })

    it('handles flat variant configuration', () => {
      const { container } = render(
        <YGrid
          config={{
            variant: 'flat',
            baseUnit: 8,
            height: 100,
          }}
          visibility="visible"
        />,
      )

      const gridElement = container.firstChild as Element
      triggerIntersection(gridElement)

      const gridContainer = screen.getByTestId('ygrid-container')
      expect(gridContainer).toHaveAttribute('data-variant', 'flat')

      const rows = gridContainer.querySelectorAll('[data-row-index]')
      rows.forEach((row, index) => {
        const expectedOpacity = index % 2 === 0 ? '0' : '1'
        expect((row as HTMLElement).style.getPropertyValue('--grid-row-opacity')).toBe(expectedOpacity)
      })
    })
  })

  describe('Height Handling', () => {
    it('handles numeric height', () => {
      render(
        <YGrid
          config={{
            height: 500,
          }}
          visibility="visible"
        />,
      )

      const container = screen.getByTestId('ygrid-container')
      expect(container.style.getPropertyValue('--grid-height')).toBe('500px')
    })

    it('handles string height', () => {
      render(
        <YGrid
          config={{
            height: '100vh',
          }}
          visibility="visible"
        />,
      )

      const container = screen.getByTestId('ygrid-container')
      expect(container.style.getPropertyValue('--grid-height')).toBe('100vh')
    })
  })

  describe('Style Customization', () => {
    it('applies custom CSS variables', () => {
      const customStyle = {
        '--grid-row-color': '#ff0000',
        '--grid-z-index': '10',
        '--custom-property': '20px',
      }

      render(
        <YGrid
          config={{
            baseUnit: 8,
          }}
          style={customStyle}
          visibility="visible"
        />,
      )

      const container = screen.getByTestId('ygrid-container')
      Object.entries(customStyle).forEach(([prop, value]) => {
        expect(container.style.getPropertyValue(prop)).toBe(value)
      })
    })

    it('combines multiple class names correctly', () => {
      render(
        <YGrid
          config={{}}
          className="custom-class-1 custom-class-2"
          visibility="visible"
        />,
      )

      const container = screen.getByTestId('ygrid-container')
      expect(container).toHaveClass('custom-class-1', 'custom-class-2')
    })
  })

  describe('Performance Optimizations', () => {
    it('memoizes calculations for identical props', () => {
      const { rerender } = render(
        <YGrid
          config={{
            baseUnit: 8,
            height: 500,
          }}
          visibility="visible"
        />,
      )

      const initialContainer = screen.getByTestId('ygrid-container')
      const initialStyles = initialContainer.getAttribute('style')

      rerender(
        <YGrid
          config={{
            baseUnit: 8,
            height: 500,
          }}
          visibility="visible"
        />,
      )

      const rerenderedContainer = screen.getByTestId('ygrid-container')
      expect(rerenderedContainer.getAttribute('style')).toBe(initialStyles)
    })
  })

})
