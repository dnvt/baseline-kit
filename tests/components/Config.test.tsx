import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Config, DEFAULT_CONFIG, useDefaultConfig, createCSSVariables } from '@components'

describe('Config component', () => {
  // Create a test consumer component that uses the config context
  const TestConsumer = ({ children, ...props }: React.HTMLProps<HTMLDivElement>) => {
    const config = useDefaultConfig()
    return (
      <div
        data-testid={props['data-testid']}
        style={createCSSVariables(config)}
        {...props}
      >
        {children}
      </div>
    )
  }

  describe('with default configuration', () => {
    it('renders children and applies default CSS variables', () => {
      render(
        <Config>
          <TestConsumer data-testid="child">Test Content</TestConsumer>
        </Config>,
      )

      const child = screen.getByTestId('child')
      const style = child.getAttribute('style') || ''
      expect(style).toContain(`--bkb: ${DEFAULT_CONFIG.base}px`)
      expect(style).toContain(`--bkbcl: ${DEFAULT_CONFIG.baseline.colors.line}`)
      expect(style).toContain(`--bkbcf: ${DEFAULT_CONFIG.baseline.colors.flat}`)
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })
  })

  describe('overriding configuration', () => {
    it('allows overriding the base unit', () => {
      render(
        <Config base={16}>
          <TestConsumer data-testid="child">Content</TestConsumer>
        </Config>,
      )
      const child = screen.getByTestId('child')
      const style = child.getAttribute('style') || ''
      expect(style).toContain('--bkb: 16px')
    })

    it('allows overriding the baseline config', () => {
      render(
        <Config
          baseline={{
            variant: 'flat',
            debugging: 'visible',
            colors: {
              line: '#FF0000',
              flat: '#00FF00',
            },
          }}
        >
          <TestConsumer data-testid="child">Content</TestConsumer>
        </Config>,
      )
      const child = screen.getByTestId('child')
      const style = child.getAttribute('style') || ''
      expect(style).toContain('--bkbcl: #FF0000')
      expect(style).toContain('--bkbcf: #00FF00')
    })

    it('allows overriding the guide config', () => {
      render(
        <Config
          guide={{
            variant: 'pattern',
            debugging: 'visible',
            colors: {
              line: '#FF0000',
              pattern: '#00FF00',
              auto: '#0000FF',
              fixed: '#FFFF00',
            },
          }}
        >
          <TestConsumer data-testid="child">Content</TestConsumer>
        </Config>,
      )
      const child = screen.getByTestId('child')
      const style = child.getAttribute('style') || ''
      expect(style).toContain('--bkgcl: #FF0000')
      expect(style).toContain('--bkgcp: #00FF00')
      expect(style).toContain('--bkgca: #0000FF')
      expect(style).toContain('--bkgcf: #FFFF00')
    })
  })

  describe('nested configuration', () => {
    it('merges nested configs correctly', () => {
      render(
        <Config base={16}>
          <Config base={24} guide={{ debugging: 'visible' }} baseline={{ variant: 'flat' }}>
            <TestConsumer data-testid="nested-child">Nested Content</TestConsumer>
          </Config>
        </Config>,
      )
      const child = screen.getByTestId('nested-child')
      const style = child.getAttribute('style') || ''
      expect(style).toContain('--bkb: 24px')
    })
  })

  describe('default value preservation', () => {
    it('maintains default values for non-overridden properties', () => {
      render(
        <Config guide={{ debugging: 'visible' }}>
          <TestConsumer data-testid="child">Content</TestConsumer>
        </Config>,
      )
      const child = screen.getByTestId('child')
      const style = child.getAttribute('style') || ''
      expect(style).toContain(`--bkgcl: ${DEFAULT_CONFIG.guide.colors.line}`)
      expect(style).toContain(`--bkgcp: ${DEFAULT_CONFIG.guide.colors.pattern}`)
    })

    it('handles partial color overrides correctly', () => {
      render(
        <Config
          guide={{
            colors: {
              ...DEFAULT_CONFIG.guide.colors,
              line: '#FF0000', // Only override line color
            },
          }}
        >
          <TestConsumer data-testid="child">Content</TestConsumer>
        </Config>,
      )
      const child = screen.getByTestId('child')
      const style = child.getAttribute('style') || ''
      expect(style).toContain('--bkgcl: #FF0000')
      expect(style).toContain(`--bkgcp: ${DEFAULT_CONFIG.guide.colors.pattern}`)
    })
  })
})
