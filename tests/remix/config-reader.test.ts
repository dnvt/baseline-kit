import { DEFAULT_CONFIG, mergeConfig } from '@baseline-kit/core'
import { createConfigReader } from '@baseline-kit/remix/shared'

class ProbeObserver {
  static instances: ProbeObserver[] = []
  constructor(private callback: ResizeObserverCallback) {
    ProbeObserver.instances.push(this)
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  fire() {
    this.callback([], this as unknown as ResizeObserver)
  }
}

let rootSize = '20px'
const rem = mergeConfig({ parentConfig: DEFAULT_CONFIG, base: '0.5rem' })
const px = mergeConfig({ parentConfig: DEFAULT_CONFIG, base: 8 })

const controllers: AbortController[] = []

/** A Remix handle with the parts the reader uses. */
function fakeHandle(config = rem) {
  const tasks: Array<() => void> = []
  const controller = new AbortController()
  controllers.push(controller)
  let signalReads = 0
  const handle = {
    props: { __baselineConfig: config },
    context: { get: () => undefined },
    queueTask: (task: () => void) => tasks.push(task),
    get signal() {
      signalReads++
      return controller.signal
    },
    update: vi.fn(() => Promise.resolve(controller.signal)),
  }
  return {
    handle,
    controller,
    signalReads: () => signalReads,
    runTasks: () => tasks.splice(0).forEach((task) => task()),
  }
}

const read = (handle: ReturnType<typeof fakeHandle>['handle'], options = {}) =>
  createConfigReader(
    handle as unknown as Parameters<typeof createConfigReader>[0],
    options
  )

const probes = () => document.querySelectorAll('[data-bk-root-probe]')
const flush = () => new Promise((resolve) => setTimeout(resolve, 50))

describe('createConfigReader', () => {
  beforeEach(() => {
    rootSize = '20px'
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
    // Removing every entry unsubscribes it, even after a failed assertion.
    controllers.splice(0).forEach((controller) => controller.abort())
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('resolves a rem base live from the first render', () => {
    const { handle, runTasks, controller } = fakeHandle()
    expect(read(handle)().base).toBe(10)
    runTasks()
    controller.abort()
  })

  it('hydrates at 16px with serverFirst, then updates to the live size', async () => {
    const { handle, runTasks, controller } = fakeHandle()
    const readConfig = read(handle, { serverFirst: true })
    expect(readConfig().base).toBe(8)
    runTasks()
    await flush()
    expect(handle.update).toHaveBeenCalledTimes(1)
    expect(readConfig().base).toBe(10)
    controller.abort()
  })

  it('subscribes after the render and updates on a root change', async () => {
    const { handle, runTasks, controller } = fakeHandle()
    const readConfig = read(handle)
    readConfig()
    expect(probes()).toHaveLength(0)
    runTasks()
    expect(probes()).toHaveLength(1)
    await flush()
    expect(handle.update).not.toHaveBeenCalled()

    rootSize = '24px'
    ProbeObserver.instances[0].fire()
    await flush()
    expect(handle.update).toHaveBeenCalledTimes(1)
    expect(readConfig().base).toBe(12)

    controller.abort()
    expect(probes()).toHaveLength(0)
  })

  it('unsubscribes when the base turns to px, and back', () => {
    const { handle, runTasks, controller } = fakeHandle()
    const readConfig = read(handle)
    readConfig()
    runTasks()
    expect(probes()).toHaveLength(1)

    handle.props.__baselineConfig = px
    expect(readConfig().base).toBe(8)
    expect(probes()).toHaveLength(0)

    handle.props.__baselineConfig = rem
    expect(readConfig().base).toBe(10)
    runTasks()
    expect(probes()).toHaveLength(1)
    controller.abort()
    expect(probes()).toHaveLength(0)
  })

  it('never subscribes for an entry removed before its task runs', () => {
    const { handle, runTasks, controller, signalReads } = fakeHandle()
    read(handle)()
    // The signal is taken during the render, before the removal.
    expect(signalReads()).toBe(1)
    controller.abort()
    runTasks()
    expect(probes()).toHaveLength(0)
  })

  it('leaves px configs alone', () => {
    const { handle, runTasks } = fakeHandle(px)
    expect(read(handle)()).toBe(px)
    runTasks()
    expect(probes()).toHaveLength(0)
  })
})
