import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CSSProperties } from 'react'
import { Spacer } from '@components'

// Mock hooks for consistent testing behavior
vi.mock('@hooks', async () => {
  const originalModule = await vi.importActual<typeof import('@hooks')>('@hooks')
  return {
    __esModule: true,
    ...originalModule,
    useConfig: (component: string) => {
      if (component === 'spacer') {
        return {
          base: 8,
          variant: 'line',
          debugging: 'hidden',
          colors: {
            line: 'rgba(255,0,0,0.3)',
            flat: 'rgba(0,255,0,0.3)',
            indice: 'rgba(0,0,255,0.3)',
          },
        }
      }
      return {}
    },
    useDebug: (debug: string | undefined, configDefault: string | undefined) => ({
      isShown: debug === 'visible',
      isHidden: debug === 'hidden',
      isNone: debug === 'none',
      debugging: debug ?? configDefault,
    }),
  }
})

describe('Spacer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<Spacer />)
      const spacer = screen.getByTestId('spacer')
      expect(spacer).toHaveStyle({
        '--bk-spacer-width': '100%',
        '--bk-spacer-height': '100%',
      })
    })

    it('applies custom dimensions', () => {
      render(<Spacer width="200px" height="100px" />)
      const spacer = screen.getByTestId('spacer')
      const style = spacer.getAttribute('style') || ''
      expect(style).toContain('--bk-spacer-width: 200px')
      expect(style).toContain('--bk-spacer-height: 104px')
    })

    it('normalizes numeric dimensions with base unit', () => {
      render(<Spacer width={16} height={24} />)
      const spacer = screen.getByTestId('spacer')
      expect(spacer).toHaveStyle({
        '--bk-spacer-width': '16px',
        '--bk-spacer-height': '24px',
      })
    })
  })

  describe('Variant Styles', () => {
    it('applies line variant styles when visible', () => {
      render(<Spacer variant="line" debugging="visible" />)
      const spacer = screen.getByTestId('spacer')
      expect(spacer).toHaveAttribute('data-variant', 'line')
      expect(spacer.className).toMatch(/line/)
    })

    it('applies flat variant styles when visible', () => {
      render(<Spacer variant="flat" debugging="visible" />)
      const spacer = screen.getByTestId('spacer')
      expect(spacer).toHaveAttribute('data-variant', 'flat')
      expect(spacer.className).toMatch(/flat/)
    })

    it('uses default variant from config when not specified', () => {
      render(<Spacer debugging="visible" />)
      const spacer = screen.getByTestId('spacer')
      expect(spacer).toHaveAttribute('data-variant', 'line')
    })
  })

  describe('Color Handling', () => {
    it('uses custom color when provided', () => {
      render(<Spacer color="#FF0000" />)
      const spacer = screen.getByTestId('spacer')
      expect(spacer).toHaveStyle({
        '--bk-spacer-color-line': '#FF0000',
        '--bk-spacer-color-flat': '#FF0000',
        '--bk-spacer-color-indice': '#FF0000',
      })
    })

    it('uses config colors when no custom color provided', () => {
      render(<Spacer />)
      const spacer = screen.getByTestId('spacer')
      expect(spacer).toHaveStyle({
        '--bk-spacer-color-line': 'rgba(255,0,0,0.3)',
        '--bk-spacer-color-flat': 'rgba(0,255,0,0.3)',
        '--bk-spacer-color-indice': 'rgba(0,0,255,0.3)',
      })
    })
  })

  describe('Measurement Indicators', () => {
    it('renders measurement indicators when debugging is visible', () => {
      const indicatorNode = (value: number, dimension: string) =>
        `${dimension}: ${value}px`

      render(
        <Spacer
          width={104} // Use the actual normalized values
          height={48} // Use the actual normalized values
          debugging="visible"
          indicatorNode={indicatorNode}
        />,
      )

      expect(screen.getByText('width: 104px')).toBeInTheDocument()
      expect(screen.getByText('height: 48px')).toBeInTheDocument()
    })

    it('does not render indicators when debugging is hidden', () => {
      const indicatorNode = (value: number, dimension: string) =>
        `${dimension}: ${value}px`

      render(
        <Spacer
          width={100}
          height={50}
          debugging="hidden"
          indicatorNode={indicatorNode}
        />,
      )

      expect(screen.queryByText('width: 100px')).not.toBeInTheDocument()
      expect(screen.queryByText('height: 50px')).not.toBeInTheDocument()
    })
  })

  describe('Custom Styling', () => {
    it('merges custom className', () => {
      render(<Spacer className="custom-class" />)
      const spacer = screen.getByTestId('spacer')
      expect(spacer).toHaveClass('custom-class')
    })

    it('applies custom style properties', () => {
      render(
        <Spacer
          style={{
            '--custom-prop': '123px',
            backgroundColor: 'blue',
          } as CSSProperties}
        />,
      )
      const spacer = screen.getByTestId('spacer')
      const style = spacer.getAttribute('style') || ''
      expect(style).toContain('--custom-prop: 123px')
      expect(style).toContain('background-color: blue')
    })

  })

  describe('Base Unit Handling', () => {
    it('uses custom base unit when provided', () => {
      render(<Spacer base={4} />)
      const spacer = screen.getByTestId('spacer')
      expect(spacer).toHaveStyle({
        '--bk-spacer-base': '4px',
      })
    })

    it('uses config base unit when not provided', () => {
      render(<Spacer />)
      const spacer = screen.getByTestId('spacer')
      expect(spacer).toHaveStyle({
        '--bk-spacer-base': '8px',
      })
    })
  })
})
