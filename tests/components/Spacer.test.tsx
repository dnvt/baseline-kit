import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { Spacer } from '@/components'
import * as HooksModule from '@/hooks/useConfig'

interface MockSpacerConfig {
  base: number
  variant: string
  visibility: string
  colors: {
    line: string
    flat: string
    indice: string
  }
}

// If you also import a real "Config" or "ComponentConfig" from your code, you can use that instead.
describe('Spacer component (with mocked useConfig)', () => {
  beforeEach(() => {
    vi.spyOn(HooksModule, 'useConfig').mockReturnValue({
      base: 8,
      variant: 'line',
      visibility: 'hidden',
      colors: {
        line: 'red',
        flat: 'blue',
        indice: 'green',
      },
    } as MockSpacerConfig)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders with default (mocked) config => line variant, hidden, base=8', () => {
    render(<Spacer height={100} />)
    const container = screen.getByTestId('spacer')

    // Because our mock says variant='line', the spacer should have .line class
    expect(container).toHaveAttribute('data-variant', 'line')
    // Also says visibility='hidden', so the hook says isShown=false => .hidden
    expect(container.className).toContain('hidden')
    // And the base=8 might cause dimension rounding if we tested that part
  })

  it('can override visibility prop => isShown=true', () => {
    render(<Spacer height={100} visibility="visible" />)
    const container = screen.getByTestId('spacer')
    // Even though the mock says "hidden", the prop=visible overrides that
    // in your code => isShown => true => .visible
    expect(container.className).toContain('visible')
  })

  it('uses the mocked colors for line, flat, indice', () => {
    render(<Spacer height={50} visibility="visible" />)
    const container = screen.getByTestId('spacer')

    // The code sets CSS variables: --pdd-spacer-color-line, etc.
    expect(container.style.getPropertyValue('--pdd-spacer-color-line')).toBe('red')
    expect(container.style.getPropertyValue('--pdd-spacer-color-flat')).toBe('blue')
    expect(container.style.getPropertyValue('--pdd-spacer-color-indice')).toBe('green')
  })
})