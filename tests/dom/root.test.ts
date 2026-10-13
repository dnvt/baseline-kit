import { getRootFontSize, subscribeRootFontSize } from '@baseline-kit/dom'

class ProbeObserver {
  static instances: ProbeObserver[] = []
  disconnected = false
  constructor(private callback: ResizeObserverCallback) {
    ProbeObserver.instances.push(this)
  }
  observe() {}
  unobserve() {}
  disconnect() {
    this.disconnected = true
  }
  fire() {
    this.callback([], this as unknown as ResizeObserver)
  }
}

let rootSize = '16px'
const probes = () => document.querySelectorAll('[data-bk-root-probe]')

describe('root font size watcher', () => {
  beforeEach(() => {
    rootSize = '16px'
    ProbeObserver.instances = []
    vi.stubGlobal('ResizeObserver', ProbeObserver)
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      (element: Element) =>
        ({
          fontSize: element === document.documentElement ? rootSize : '16px',
        }) as CSSStyleDeclaration
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('reads the live root font size, else 16', () => {
    rootSize = '20px'
    expect(getRootFontSize()).toBe(20)
    rootSize = ''
    expect(getRootFontSize()).toBe(16)
  })

  it('shares one probe and notifies only on a change', () => {
    const first = vi.fn()
    const second = vi.fn()
    const offFirst = subscribeRootFontSize(first)
    const offSecond = subscribeRootFontSize(second)
    expect(probes()).toHaveLength(1)
    // Beside <body>, where frameworks diffing the body can't adopt it.
    expect(probes()[0].parentElement).toBe(document.documentElement)
    expect(ProbeObserver.instances).toHaveLength(1)
    const [observer] = ProbeObserver.instances

    observer.fire()
    expect(first).not.toHaveBeenCalled()

    rootSize = '20px'
    observer.fire()
    expect(first).toHaveBeenCalledTimes(1)
    expect(second).toHaveBeenCalledTimes(1)
    expect(getRootFontSize()).toBe(20)

    offFirst()
    offFirst()
    rootSize = '24px'
    observer.fire()
    expect(first).toHaveBeenCalledTimes(1)
    expect(second).toHaveBeenCalledTimes(2)

    offSecond()
    expect(probes()).toHaveLength(0)
    expect(observer.disconnected).toBe(true)
  })

  it('puts the probe back when something removes it', () => {
    const off = subscribeRootFontSize(vi.fn())
    const [probe] = probes()
    probe.remove()
    ProbeObserver.instances[0].fire()
    expect(probe.isConnected).toBe(true)
    off()
  })

  it('never removes an element that is no longer the probe', () => {
    const off = subscribeRootFontSize(vi.fn())
    const [probe] = probes()
    // A framework reused the element for its own content.
    probe.removeAttribute('data-bk-root-probe')
    off()
    expect(probe.isConnected).toBe(true)
    probe.remove()
  })
})
