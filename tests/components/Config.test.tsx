import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Config, DEFAULT_CONFIG } from '@components'

describe('Config component', () => {
  describe('with default configuration', () => {
    it('renders children and applies default CSS variables', () => {
      render(
        <Config>
          <div data-testid="child">Test Content</div>
        </Config>,
      )

      const child = screen.getByTestId('child')
      // Assuming the Config component wraps children in a div that receives the CSS variables.
      const wrapper = child.parentElement!
      const style = wrapper.getAttribute('style') || ''
      expect(style).toContain(`--pdd-base: ${DEFAULT_CONFIG.base}px`)
      expect(style).toContain(`--pdd-baseline-color-line: ${DEFAULT_CONFIG.baseline.colors.line}`)
      expect(style).toContain(`--pdd-baseline-color-flat: ${DEFAULT_CONFIG.baseline.colors.flat}`)
      expect(style).toContain(`--pdd-guide-color-line: ${DEFAULT_CONFIG.guide.colors.line}`)
      expect(style).toContain(`--pdd-guide-color-pattern: ${DEFAULT_CONFIG.guide.colors.pattern}`)
      // You can add additional checks for spacer, box, padder, etc. if needed.
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })
  })

  describe('overriding configuration', () => {
    it('allows overriding the base unit', () => {
      render(
        <Config base={16}>
          <div data-testid="child">Content</div>
        </Config>,
      )
      const wrapper = screen.getByTestId('child').parentElement!
      const style = wrapper.getAttribute('style') || ''
      expect(style).toContain('--pdd-base: 16px')
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
          <div data-testid="child">Content</div>
        </Config>,
      )
      const wrapper = screen.getByTestId('child').parentElement!
      const style = wrapper.getAttribute('style') || ''
      expect(style).toContain('--pdd-baseline-color-line: #FF0000')
      expect(style).toContain('--pdd-baseline-color-flat: #00FF00')
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
          <div data-testid="child">Content</div>
        </Config>,
      )
      const wrapper = screen.getByTestId('child').parentElement!
      const style = wrapper.getAttribute('style') || ''
      expect(style).toContain('--pdd-guide-color-line: #FF0000')
      expect(style).toContain('--pdd-guide-color-pattern: #00FF00')
      expect(style).toContain('--pdd-guide-color-auto: #0000FF')
      expect(style).toContain('--pdd-guide-color-fixed: #FFFF00')
    })

    it('allows overriding the spacer config', () => {
      render(
        <Config
          spacer={{
            variant: 'flat',
            debugging: 'visible',
            colors: {
              line: '#FF0000',
              flat: '#00FF00',
              indice: '#0000FF',
            },
          }}
        >
          <div data-testid="child">Content</div>
        </Config>,
      )
      const wrapper = screen.getByTestId('child').parentElement!
      const style = wrapper.getAttribute('style') || ''
      expect(style).toContain('--pdd-spacer-color-line: #FF0000')
      expect(style).toContain('--pdd-spacer-color-flat: #00FF00')
      expect(style).toContain('--pdd-spacer-color-indice: #0000FF')
    })

    it('allows overriding the box config', () => {
      render(
        <Config
          box={{
            debugging: 'visible',
            colors: {
              line: '#FF0000',
              flat: '#00FF00',
              indice: '#0000FF',
            },
          }}
        >
          <div data-testid="child">Content</div>
        </Config>,
      )
      const wrapper = screen.getByTestId('child').parentElement!
      const style = wrapper.getAttribute('style') || ''
      expect(style).toContain('--pdd-box-color-line: #FF0000')
      expect(style).toContain('--pdd-box-color-flat: #00FF00')
      expect(style).toContain('--pdd-box-color-indice: #0000FF')
    })

    it('allows overriding the padder config', () => {
      render(
        <Config
          padder={{
            debugging: 'visible',
            color: '#FF0000',
          }}
        >
          <div data-testid="child">Content</div>
        </Config>,
      )
      const wrapper = screen.getByTestId('child').parentElement!
      const style = wrapper.getAttribute('style') || ''
      expect(style).toContain('--pdd-padder-color: #FF0000')
    })
  })

  describe('nested configuration', () => {
    it('merges nested configs correctly', () => {
      render(
        <Config base={16}>
          <Config
            base={24}
            guide={{ debugging: 'visible' }}
            baseline={{ variant: 'flat' }}
          >
            <div data-testid="nested-child">Nested Content</div>
          </Config>
        </Config>,
      )
      const wrapper = screen.getByTestId('nested-child').parentElement!
      const style = wrapper.getAttribute('style') || ''
      // Expect the inner (nested) Config to override the base with 24.
      expect(style).toContain('--pdd-base: 24px')
    })
  })

  describe('default value preservation', () => {
    it('maintains default values for non-overridden properties', () => {
      render(
        <Config guide={{ debugging: 'visible' }}>
          <div data-testid="child">Content</div>
        </Config>,
      )
      const wrapper = screen.getByTestId('child').parentElement!
      const style = wrapper.getAttribute('style') || ''
      // Expect that properties not overridden in guide remain as in DEFAULT_CONFIG.
      expect(style).toContain(`--pdd-guide-color-line: ${DEFAULT_CONFIG.guide.colors.line}`)
      expect(style).toContain(`--pdd-guide-color-pattern: ${DEFAULT_CONFIG.guide.colors.pattern}`)
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
          <div data-testid="child">Content</div>
        </Config>,
      )
      const wrapper = screen.getByTestId('child').parentElement!
      const style = wrapper.getAttribute('style') || ''
      expect(style).toContain('--pdd-guide-color-line: #FF0000')
      expect(style).toContain(`--pdd-guide-color-pattern: ${DEFAULT_CONFIG.guide.colors.pattern}`)
    })
  })
})