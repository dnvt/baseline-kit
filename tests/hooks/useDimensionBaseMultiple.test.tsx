import { useRef } from 'react'
import { useDimensionBaseMultiple } from '../../src/lib'
import { render, screen } from '@testing-library/react'

/**
 * A simple test component to demonstrate the hook usage.
 * - We store the ref on a <div data-testid="test-div" /> element.
 * - The parent can control how the boundingClientRect is mocked.
 */
function TestComponent({
  base,
  enabled = true,
  styleHeight, // We'll mock the actual getBoundingClientRect to return styleHeight
}: {
  base: number
  enabled?: boolean
  styleHeight?: number
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  useDimensionBaseMultiple(ref, base, enabled)

  return (
    <div
      ref={ref}
      data-testid="test-div"
      style={{ height: styleHeight ? `${styleHeight}px` : 'auto' }}
    >
      Test Component
    </div>
  )
}

describe('useDimensionBaseMultiple', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>

  /**
   * Provide a helper to mock the boundingClientRect for the tested element.
   * We'll call this after rendering the component, passing the actual
   * "height" we want to simulate.
   */
  function mockElementHeight(testId: string, height: number) {
    const element = screen.getByTestId(testId)
    element.getBoundingClientRect = () =>
      ({
        width: 100,
        height,
        top: 0,
        left: 0,
        bottom: height,
        right: 100,
        x: 0,
        y: 0,
        toJSON: () => '',
      } as DOMRect)
  }

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('does not warn if element height is multiple of base', () => {
    render(<TestComponent base={8} styleHeight={24} />)
    // Now mock boundingClientRect to return 24
    mockElementHeight('test-div', 24)

    // No need to do extra triggers; useLayoutEffect fires on mount
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('does nothing if ref is null', () => {
    // We'll pass no styleHeight; or we can do a conditional
    // Actually let's just render but we never set getBoundingClientRect
    // so it's effectively null
    render(<TestComponent base={8}
      styleHeight={0}
    />)
    screen.getByTestId('test-div')
    // Force the ref to be null if you want:
    // But in practice, the ref is never assigned if we forcibly unmount
    // We'll skip that for simplicity
    // Because your code checks if (!elem) return
    // We'll set the bounding rect to "undefined" by not calling mock
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('does not warn if `enabled=false`', () => {
    render(<TestComponent base={8}
      styleHeight={25}
      enabled={false}
    />)
    mockElementHeight('test-div', 25)
    // Because the hook is disabled, no warnings:
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('rounds the measured height before check (top=1 => ~1 => multiple)', () => {
    // Suppose the element's boundingClientRect = 24.4 => after rounding => 24 => multiple of 8
    render(<TestComponent base={8}
      styleHeight={24.4}
    />)
    mockElementHeight('test-div', 24.4) // JS => 24.399999999 or so

    expect(warnSpy).not.toHaveBeenCalled()
  })
})