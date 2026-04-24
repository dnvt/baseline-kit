import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CSSProperties } from 'react'
import { Guide } from '@components'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('Guide component', () => {
  let rectSpy: ReturnType<typeof vi.spyOn>

  beforeAll(() => {
    rectSpy = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue({
        width: 1024,
        height: 768,
        top: 0,
        right: 1024,
        bottom: 768,
        left: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect)
  })

  afterAll(() => {
    rectSpy.mockRestore()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a line variant with gradient metadata instead of column nodes', () => {
    render(
      <Guide variant="line" gap={10} debugging="visible" data-testid="guide" />
    )
    const guideEl = screen.getByTestId('guide')
    expect(guideEl.getAttribute('style')).toContain('--bkgd-g: 7px')
    expect(guideEl.getAttribute('style')).toContain('--bkgd-line-period: 8px')
    expect(guideEl.querySelectorAll('[data-column-index]').length).toBe(0)
  })

  it('handles "auto" variant with numeric columnWidth', () => {
    render(
      <Guide
        variant="auto"
        columnWidth={100}
        gap={16}
        debugging="visible"
        data-testid="guide"
      />
    )
    const guideEl = screen.getByTestId('guide')
    expect(guideEl.dataset.variant).toBe('auto')
    const columns = guideEl.querySelectorAll('[data-column-index]')
    expect(columns.length).toBe(8)
    expect(guideEl.getAttribute('style')).toContain('--bkgd-g: 16px')
  })

  it('handles "pattern" variant array columns', () => {
    render(
      <Guide
        variant="pattern"
        columns={['1fr', '2fr', '3fr']}
        gap={10}
        data-testid="guide"
        debugging="visible"
      />
    )
    const guideEl = screen.getByTestId('guide')
    expect(guideEl.dataset.variant).toBe('pattern')
    const cols = guideEl.querySelectorAll('[data-column-index]')
    expect(cols.length).toBe(3)
    expect(guideEl.getAttribute('style')).toContain('--bkgd-t: 1fr 2fr 3fr')
    expect(guideEl.getAttribute('style')).toContain('--bkgd-g: 8px')
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
      />
    )
    const guideEl = screen.getByTestId('guide')
    expect(guideEl.dataset.variant).toBe('fixed')
    const cols = guideEl.querySelectorAll('[data-column-index]')
    expect(cols.length).toBe(5)
    expect(guideEl.getAttribute('style')).toContain('--bkgd-g: 16px')
    expect(guideEl.getAttribute('style')).toContain('--bkgd-t: repeat(5, 120px)')
  })

  it('renders hidden when debugging="hidden"', () => {
    render(<Guide debugging="hidden" data-testid="guide" />)
    const guideEl = screen.getByTestId('guide')
    expect(guideEl.className).toContain('h')
  })

  it('renders hidden by default if no debugging prop is given', () => {
    render(<Guide data-testid="guide" />)
    const guideEl = screen.getByTestId('guide')
    expect(guideEl.className).toContain('h')
  })

  it('applies explicit sizing variables for client rendering', () => {
    render(
      <Guide
        debugging="visible"
        width="1200px"
        height="80vh"
        maxWidth="90vw"
        data-testid="guide"
      />
    )
    const guideEl = screen.getByTestId('guide')
    const styleAttr = guideEl.getAttribute('style') || ''
    expect(styleAttr).toContain('--bkgd-w: 1200px')
    expect(styleAttr).toContain('--bkgd-h: 80vh')
    expect(styleAttr).toContain('--bkgd-mw: 90vw')
  })

  it('preserves zero sizing values', () => {
    render(
      <Guide debugging="visible" width={0} height={0} data-testid="guide" />
    )
    const guideEl = screen.getByTestId('guide')
    const styleAttr = guideEl.getAttribute('style') || ''
    expect(styleAttr).toContain('--bkgd-w: 0px')
    expect(styleAttr).toContain('--bkgd-h: 0px')
  })

  it('consumes sizing variables in the Guide stylesheet', () => {
    const css = readFileSync(
      resolve(
        process.cwd(),
        'packages/react/src/components/Guide/styles.module.css'
      ),
      'utf8'
    )
    expect(css).toContain('width: var(--bkgd-w, 100%)')
    expect(css).toContain('height: var(--bkgd-h, 100%)')
    expect(css).toContain('max-width: var(--bkgd-mw, none)')
  })

  it('keeps the simplified fallback when ssrMode is enabled', () => {
    render(<Guide debugging="visible" ssrMode data-testid="guide" />)
    const guideEl = screen.getByTestId('guide')
    expect(guideEl.className).toContain('ssr')
    expect(guideEl.className).toContain('h')
    expect(guideEl.querySelectorAll('[data-column-index]').length).toBe(0)
  })

  it('applies custom CSS props from style', () => {
    render(
      <Guide
        style={
          {
            '--my-custom': '999px',
            backgroundColor: 'red',
          } as CSSProperties
        }
        data-testid="guide"
      />
    )
    const guideEl = screen.getByTestId('guide')
    const styleAttr = guideEl.getAttribute('style') || ''
    expect(styleAttr).toContain('--my-custom: 999px')
    expect(styleAttr).toContain('background-color: red')
  })

  it('combines additional className', () => {
    render(<Guide className="customA customB" data-testid="guide" />)
    const guideEl = screen.getByTestId('guide')
    expect(guideEl.className).toMatch(/customA/)
    expect(guideEl.className).toMatch(/customB/)
  })
})
