import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  Box,
  Config,
  DEFAULT_CONFIG,
  Spacer,
  useDefaultConfig,
  createCSSVariables,
} from '@components'

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
      expect(style).toContain(`--bk-base: ${DEFAULT_CONFIG.base}px`)
      expect(style).toContain(`--bkbl-cl: ${DEFAULT_CONFIG.baseline.colors.line}`)
      expect(style).toContain(`--bkbl-cf: ${DEFAULT_CONFIG.baseline.colors.flat}`)
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
      expect(style).toContain('--bk-base: 16px')
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
      expect(style).toContain('--bkbl-cl: #FF0000')
      expect(style).toContain('--bkbl-cf: #00FF00')
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
      expect(style).toContain('--bkgd-cl: #FF0000')
      expect(style).toContain('--bkgd-cp: #00FF00')
      expect(style).toContain('--bkgd-ca: #0000FF')
      expect(style).toContain('--bkgd-cf: #FFFF00')
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
      expect(style).toContain('--bk-base: 24px')
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
      expect(style).toContain(`--bkgd-cl: ${DEFAULT_CONFIG.guide.colors.line}`)
      expect(style).toContain(`--bkgd-cp: ${DEFAULT_CONFIG.guide.colors.pattern}`)
    })

    it('handles partial color overrides correctly', () => {
      render(
        <Config
          guide={{
            colors: {
              line: '#FF0000', // Only override line color
            },
          }}
        >
          <TestConsumer data-testid="child">Content</TestConsumer>
        </Config>,
      )
      const child = screen.getByTestId('child')
      const style = child.getAttribute('style') || ''
      expect(style).toContain('--bkgd-cl: #FF0000')
      expect(style).toContain(`--bkgd-cp: ${DEFAULT_CONFIG.guide.colors.pattern}`)
    })
  })

  describe('actual component consumers', () => {
    it('propagates Config colors to Box without a test-only wrapper', () => {
      render(
        <Config
          box={{
            debugging: 'visible',
            colors: {
              line: '#ff0000',
              flat: '#00ff00',
              text: '#0000ff',
            },
          }}
        >
          <Box>Box content</Box>
        </Config>
      )

      expect(screen.getByTestId('box').getAttribute('style')).toContain(
        '--bkbx-cl: #ff0000'
      )
    })

    it('propagates Config colors to Spacer without a test-only wrapper', () => {
      render(
        <Config
          spacer={{
            debugging: 'visible',
            colors: {
              line: '#ff0000',
              flat: '#00ff00',
              text: '#0000ff',
            },
          }}
        >
          <Spacer height={16} variant="flat" />
        </Config>
      )

      expect(screen.getByTestId('spacer').getAttribute('style')).toEqual(
        expect.stringContaining('--bksp-cf: #00ff00')
      )
    })

    it('updates actual consumers when a Config scope changes', () => {
      const { rerender } = render(
        <Config
          box={{
            debugging: 'visible',
            colors: {
              line: '#ff0000',
              flat: '#00ff00',
              text: '#0000ff',
            },
          }}
        >
          <Box>Box content</Box>
        </Config>
      )

      expect(screen.getByTestId('box').getAttribute('style')).toContain(
        '--bkbx-cl: #ff0000'
      )

      rerender(
        <Config
          box={{
            debugging: 'visible',
            colors: {
              line: '#0000ff',
              flat: '#00ff00',
              text: '#ff0000',
            },
          }}
        >
          <Box>Box content</Box>
        </Config>
      )

      expect(screen.getByTestId('box').getAttribute('style')).toContain(
        '--bkbx-cl: #0000ff'
      )
    })
  })
})
