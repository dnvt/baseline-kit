// Spacer.test.tsx
import { render, screen } from '@testing-library/react'
import { SPACER as CONFIG } from '@config'
import { SpacerConfig, Spacer } from '../Spacer'

describe('Spacer', () => {
  describe('Rendering', () => {
    it('renders with hidden visibility by default', () => {
      render(<Spacer height={100} />)
      const container = screen.getByTestId('spacer-container')
      expect(container.className).toContain('hidden')
    })

    it('renders with visible visibility when specified', () => {
      render(<Spacer height={100} visibility="visible" />)
      const container = screen.getByTestId('spacer-container')
      expect(container.className).toContain('visible')
    })

    it('combines custom class names correctly', () => {
      render(
        <Spacer
          height={100}
          className="custom-class-1 custom-class-2"
          visibility="visible"
        />,
      )
      const container = screen.getByTestId('spacer-container')
      expect(container.className).toContain('custom-class-1')
      expect(container.className).toContain('custom-class-2')
    })
  })

  describe('Dimensions', () => {
    it('handles height prop correctly', () => {
      render(<Spacer height={100} visibility="visible" />)
      const container = screen.getByTestId('spacer-container')
      expect(container.style.getPropertyValue('--padd-spacer-height')).toBe('104px')
      expect(container.style.getPropertyValue('--padd-spacer-width')).toBe('100%')
    })

    it('handles width prop correctly', () => {
      render(<Spacer width={200} visibility="visible" />)
      const container = screen.getByTestId('spacer-container')
      expect(container.style.getPropertyValue('--padd-spacer-width')).toBe('200px')
      expect(container.style.getPropertyValue('--padd-spacer-height')).toBe('100%')
    })

    it('normalizes dimensions to base unit', () => {
      const config: SpacerConfig = {
        variant: 'line',
        baseUnit: 8,
      }
      render(<Spacer height={103} config={config} visibility="visible" />)
      const container = screen.getByTestId('spacer-container')
      expect(container.style.getPropertyValue('--padd-spacer-height')).toBe('104px')
    })

    it('handles CSS units correctly', () => {
      render(<Spacer height="50vh" visibility="visible" />)
      const container = screen.getByTestId('spacer-container')
      expect(container.style.getPropertyValue('--padd-spacer-height')).toBe('50vh')
    })
  })

  describe('Variants', () => {
    it('handles line variant correctly', () => {
      const config: SpacerConfig = {
        variant: 'line',
      }
      render(<Spacer height={100} config={config} visibility="visible" />)
      const container = screen.getByTestId('spacer-container')
      expect(container).toHaveAttribute('data-variant', 'line')
    })

    it('handles flat variant correctly', () => {
      const config: SpacerConfig = {
        variant: 'flat',
      }
      render(<Spacer height={100} config={config} visibility="visible" />)
      const container = screen.getByTestId('spacer-container')
      expect(container).toHaveAttribute('data-variant', 'flat')
    })
  })

  describe('Style Customization', () => {
    it('applies custom color', () => {
      const config: SpacerConfig = {
        variant: 'line',
        color: '#FF0000',
      }
      render(<Spacer height={100} config={config} visibility="visible" />)
      const container = screen.getByTestId('spacer-container')
      expect(container.style.getPropertyValue('--padd-spacer-color')).toBe('#FF0000')
    })

    it('applies custom styles', () => {
      const customStyle = {
        '--custom-property': '20px',
        backgroundColor: 'red',
      }
      render(
        <Spacer
          height={100}
          style={customStyle}
          visibility="visible"
        />,
      )
      const container = screen.getByTestId('spacer-container')
      expect(container.style.getPropertyValue('--custom-property')).toBe('20px')
      expect(container.style.backgroundColor).toBe('red')
    })
  })

  describe('Indicator Node', () => {
    it('renders indicator node when visible', () => {
      const mockIndicator = vi.fn((value: number) => <span>{value}px</span>)
      const config: SpacerConfig = {
        variant: 'line',
        baseUnit: 8,
      }

      render(
        <Spacer
          height={100}
          config={config}
          indicatorNode={mockIndicator}
          visibility="visible"
        />,
      )
      // The value is normalized to the nearest base unit multiple (104)
      expect(mockIndicator).toHaveBeenCalledWith(104, 'height')
      expect(screen.getByText('104px')).toBeInTheDocument()
    })

    it('does not render indicator node when hidden', () => {
      const mockIndicator = vi.fn((value: number) => <span>{value}px</span>)
      render(
        <Spacer
          height={100}
          indicatorNode={mockIndicator}
          visibility="hidden"
        />,
      )
      expect(mockIndicator).not.toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined dimensions', () => {
      // @ts-expect-error: Need to pass a heigh or width accurate value
      render(<Spacer visibility="visible" />)
      const container = screen.getByTestId('spacer-container')
      expect(container.style.getPropertyValue('--padd-spacer-height')).toBe('100%')
      expect(container.style.getPropertyValue('--padd-spacer-width')).toBe('100%')
    })

    it('handles invalid CSS values', () => {
      // @ts-expect-error: Need to pass a heigh or width accurate value
      render(<Spacer height="invalid" visibility="visible" />)
      const container = screen.getByTestId('spacer-container')
      // Invalid values should be passed through as-is
      expect(container.style.getPropertyValue('--padd-spacer-height')).toBe('invalid')
    })

    it('applies default config values when not provided', () => {
      render(<Spacer height={100} visibility="visible" />)
      const container = screen.getByTestId('spacer-container')
      expect(container).toHaveAttribute('data-variant', CONFIG.variant)
      expect(container.style.getPropertyValue('--padd-z-index')).toBe(CONFIG.zIndex.toString())
    })
  })


})
