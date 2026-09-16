import { expect, test, type Page } from '@playwright/test'

const dimensionCases = [
  { id: 'width-omitted', axis: 'width' },
  { id: 'width-half', axis: 'width' },
  { id: 'width-viewport', axis: 'width' },
  { id: 'width-calc', axis: 'width' },
  { id: 'width-pixels', axis: 'width' },
  { id: 'width-zero', axis: 'width' },
  { id: 'height-omitted', axis: 'height' },
  { id: 'height-half', axis: 'height' },
  { id: 'height-full', axis: 'height' },
  { id: 'height-vh', axis: 'height' },
  { id: 'height-vw', axis: 'height' },
  { id: 'height-dvh', axis: 'height' },
  { id: 'height-rem', axis: 'height' },
  { id: 'height-em', axis: 'height' },
  { id: 'height-calc', axis: 'height' },
  { id: 'height-pixels', axis: 'height' },
  { id: 'height-zero', axis: 'height' },
] as const

async function readDimensionMatrix(page: Page, prefix: string) {
  return page.evaluate(
    ({ cases }) =>
      cases.map(({ id, axis }) => {
        const element = document.querySelector(
          `#${id} [data-testid="baseline"]`
        )
        if (!element) throw new Error(`Missing dimension case: ${id}`)
        const rect = element.getBoundingClientRect()
        return {
          id,
          axis,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          declared: element.style
            .getPropertyValue(axis === 'width' ? '--bkbl-w' : '--bkbl-h')
            .trim(),
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
        }
      }),
    {
      cases: dimensionCases.map(({ id, axis }) => ({
        id: `${prefix}-${id}`,
        axis,
      })),
    }
  )
}

async function readTextBoxStyles(page: Page, selector: string) {
  return page.locator(selector).evaluateAll((elements) =>
    elements.map((element) => {
      const styles = getComputedStyle(element)
      return {
        trim: styles.getPropertyValue('text-box-trim'),
        edge: styles.getPropertyValue('text-box-edge'),
      }
    })
  )
}

async function installNativeLifecycleProbe(page: Page) {
  await page.addInitScript(() => {
    const probe = {
      resizeActive: 0,
      intersectionActive: 0,
      windowListeners: new Map<
        string,
        Set<EventListenerOrEventListenerObject>
      >(),
      callbacksAfterDisconnect: 0,
    }
    const resizeRecords = new WeakMap<object, { disconnected: boolean }>()
    const intersectionRecords = new WeakMap<object, { disconnected: boolean }>()
    const target = window as typeof window & {
      __baselineNativeLifecycleProbe: typeof probe
      ResizeObserver: typeof ResizeObserver
      IntersectionObserver: typeof IntersectionObserver
    }
    target.__baselineNativeLifecycleProbe = probe

    const OriginalResizeObserver = target.ResizeObserver
    if (OriginalResizeObserver) {
      target.ResizeObserver = class extends OriginalResizeObserver {
        constructor(callback: ResizeObserverCallback) {
          let record: { disconnected: boolean } | undefined
          super((entries, observer) => {
            if (record?.disconnected) probe.callbacksAfterDisconnect += 1
            callback(entries, observer)
          })
          record = { disconnected: false }
          resizeRecords.set(this, record)
          probe.resizeActive += 1
        }

        disconnect() {
          const record = resizeRecords.get(this)
          if (record && !record.disconnected) {
            record.disconnected = true
            probe.resizeActive -= 1
          }
          return super.disconnect()
        }
      } as typeof ResizeObserver
    }

    const OriginalIntersectionObserver = target.IntersectionObserver
    if (OriginalIntersectionObserver) {
      target.IntersectionObserver = class extends OriginalIntersectionObserver {
        constructor(
          callback: IntersectionObserverCallback,
          options?: IntersectionObserverInit
        ) {
          let record: { disconnected: boolean } | undefined
          super((entries, observer) => {
            if (record?.disconnected) probe.callbacksAfterDisconnect += 1
            callback(entries, observer)
          }, options)
          record = { disconnected: false }
          intersectionRecords.set(this, record)
          probe.intersectionActive += 1
        }

        disconnect() {
          const record = intersectionRecords.get(this)
          if (record && !record.disconnected) {
            record.disconnected = true
            probe.intersectionActive -= 1
          }
          return super.disconnect()
        }
      } as typeof IntersectionObserver
    }

    const eventTypes = new Set(['scroll', 'resize'])
    const captureOf = (
      options: boolean | AddEventListenerOptions | undefined
    ) => (typeof options === 'boolean' ? options : Boolean(options?.capture))
    const listenerKey = (
      type: string,
      options: boolean | AddEventListenerOptions | undefined
    ) => `${type}:${captureOf(options)}`
    const originalAddEventListener = window.addEventListener.bind(window)
    const originalRemoveEventListener = window.removeEventListener.bind(window)

    window.addEventListener = ((type, listener, options) => {
      if (listener && eventTypes.has(type)) {
        const key = listenerKey(type, options)
        const listeners =
          probe.windowListeners.get(key) ??
          new Set<EventListenerOrEventListenerObject>()
        listeners.add(listener)
        probe.windowListeners.set(key, listeners)
      }
      return originalAddEventListener(type, listener, options)
    }) as typeof window.addEventListener

    window.removeEventListener = ((type, listener, options) => {
      if (listener && eventTypes.has(type)) {
        probe.windowListeners.get(listenerKey(type, options))?.delete(listener)
      }
      return originalRemoveEventListener(type, listener, options)
    }) as typeof window.removeEventListener
  })
}

async function readNativeLifecycleProbe(page: Page) {
  return page.evaluate(() => {
    const probe = (
      window as unknown as {
        __baselineNativeLifecycleProbe: {
          resizeActive: number
          intersectionActive: number
          windowListeners: Map<string, Set<unknown>>
          callbacksAfterDisconnect: number
        }
      }
    ).__baselineNativeLifecycleProbe
    return {
      resizeActive: probe.resizeActive,
      intersectionActive: probe.intersectionActive,
      windowListeners: [...probe.windowListeners.values()].reduce(
        (total, listeners) => total + listeners.size,
        0
      ),
      callbacksAfterDisconnect: probe.callbacksAfterDisconnect,
    }
  })
}

async function waitForAnimationFrames(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      )
  )
}

const nativeCascadingWarnings = new WeakMap<Page, string[]>()

function assertDimensionMatrix(
  measurements: Awaited<ReturnType<typeof readDimensionMatrix>>
) {
  const viewportWidth = measurements[0].viewportWidth
  const viewportHeight = measurements[0].viewportHeight
  const expected: Record<
    string,
    { width?: number; height?: number; declared: string }
  > = {
    'width-omitted': { width: 400, declared: '' },
    'width-half': { width: 200, declared: '50%' },
    'width-viewport': { width: viewportWidth, declared: '100vw' },
    'width-calc': { width: 376, declared: 'calc(100% - 24px)' },
    'width-pixels': { width: 160, declared: '160px' },
    'width-zero': { width: 0, declared: '0px' },
    'height-omitted': { height: 240, declared: '' },
    'height-half': { height: 120, declared: '50%' },
    'height-full': { height: 240, declared: '100%' },
    'height-vh': { height: viewportHeight, declared: '100vh' },
    'height-vw': { height: viewportWidth, declared: '100vw' },
    'height-dvh': { height: viewportHeight, declared: '100dvh' },
    'height-rem': { height: 160, declared: '10rem' },
    'height-em': { height: 160, declared: '10em' },
    'height-calc': { height: 216, declared: 'calc(100% - 24px)' },
    'height-pixels': { height: 160, declared: '160px' },
    'height-zero': { height: 0, declared: '0px' },
  }

  for (const measurement of measurements) {
    const key = measurement.id.replace(/^(?:react|remix)-dimension-/, '')
    const expectation = expected[key]
    if (!expectation) throw new Error(`Unexpected dimension case: ${key}`)
    expect(measurement.declared).toBe(expectation.declared)
    if (measurement.axis === 'width') {
      expect(measurement.width).toBe(expectation.width)
    } else {
      expect(measurement.height).toBe(expectation.height)
    }
  }
}

test.beforeEach(async ({ page }, testInfo) => {
  page.on('pageerror', (error) => {
    throw error
  })

  if (testInfo.titlePath.includes('native Remix adapter')) {
    const warnings: string[] = []
    nativeCascadingWarnings.set(page, warnings)
    page.on('console', (message) => {
      if (
        message.type() === 'warning' &&
        message.text().includes('cascading component updates')
      ) {
        warnings.push(message.text())
      }
    })
  }

  if (testInfo.titlePath.includes('native Remix adapter')) return

  await page.goto('/')
})

test.afterEach(({ page }, testInfo) => {
  if (!testInfo.titlePath.includes('native Remix adapter')) return
  expect(nativeCascadingWarnings.get(page) ?? []).toEqual([])
})

test('SSR fallback keeps content and geometry usable without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()

  await page.goto('/')

  await expect(page.locator('#ssr-content')).toHaveText(
    'Server-rendered content remains available.'
  )

  const baseline = page.locator('#baseline-percent [data-testid="baseline"]')
  await expect(baseline).toHaveClass(/ssr/)

  const geometry = await baseline.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    return { width: rect.width, height: rect.height }
  })

  expect(geometry.width).toBe(320)
  expect(geometry.height).toBe(160)
  await context.close()
})

test('Baseline rows follow the browser-resolved percentage height', async ({
  page,
}) => {
  const baseline = page.locator('#baseline-percent [data-testid="baseline"]')

  await expect(baseline.locator('[data-row-index]').first()).toBeVisible()
  await expect(baseline).toHaveCount(1)

  const measurements = await baseline.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    return {
      height: rect.height,
      rows: element.querySelectorAll('[data-row-index]').length,
      declaredHeight: element.style.getPropertyValue('--bkbl-h'),
    }
  })

  expect(measurements.declaredHeight).toBe('100%')
  expect(measurements.height).toBe(160)
  expect(measurements.rows).toBe(Math.ceil(measurements.height / 8))
})

test('default paint remains visible without theme CSS', async ({ page }) => {
  const baseline = page.locator(
    '#baseline-default-paint [data-testid="baseline"]'
  )

  await expect(baseline.locator('[data-row-index]').first()).toBeVisible()
  await expect
    .poll(() =>
      baseline.evaluate((element) => {
        const row = element.querySelector('[data-row-index]')
        return row ? getComputedStyle(row).backgroundColor : ''
      })
    )
    .not.toBe('rgba(0, 0, 0, 0)')
})

test('Baseline rows follow the browser-resolved viewport height', async ({
  page,
}) => {
  const baseline = page.locator('#baseline-viewport [data-testid="baseline"]')

  await expect(baseline.locator('[data-row-index]').first()).toBeVisible()

  const measurements = await baseline.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    return {
      height: rect.height,
      rows: element.querySelectorAll('[data-row-index]').length,
      declaredHeight: element.style.getPropertyValue('--bkbl-h'),
    }
  })

  expect(measurements.declaredHeight).toBe('100vh')
  expect(measurements.height).toBeGreaterThan(0)
  expect(measurements.rows).toBe(Math.ceil(measurements.height / 8))
})

test('Baseline viewport sizing responds to a browser resize', async ({
  page,
}) => {
  const baseline = page.locator('#baseline-viewport [data-testid="baseline"]')

  await page.setViewportSize({ width: 1280, height: 600 })
  await expect
    .poll(() =>
      baseline.evaluate((element) => {
        const rect = element.getBoundingClientRect()
        return {
          height: Math.round(rect.height),
          rows: element.querySelectorAll('[data-row-index]').length,
        }
      })
    )
    .toEqual({ height: 600, rows: 75 })
})

test('Baseline rows respond to a containing-block resize', async ({ page }) => {
  const parent = page.locator('#baseline-parent-resize')
  const baseline = parent.locator('[data-testid="baseline"]')

  await parent.evaluate((element) => {
    element.style.height = '96px'
  })

  await expect
    .poll(() =>
      baseline.evaluate((element) => ({
        height: Math.round(element.getBoundingClientRect().height),
        rows: element.querySelectorAll('[data-row-index]').length,
      }))
    )
    .toEqual({ height: 96, rows: 12 })
})

test('Baseline rows respond to a root font-size change', async ({ page }) => {
  const baseline = page.locator(
    '#react-dimension-height-rem [data-testid="baseline"]'
  )

  await page.evaluate(() => {
    document.documentElement.style.fontSize = '20px'
  })

  await expect
    .poll(() =>
      baseline.evaluate((element) => ({
        height: Math.round(element.getBoundingClientRect().height),
        rows: element.querySelectorAll('[data-row-index]').length,
      }))
    )
    .toEqual({ height: 200, rows: 25 })
})

test('Baseline virtualization stays bounded while scrolling a tall fixture', async ({
  page,
}) => {
  const baseline = page.locator(
    '#baseline-virtual-tall [data-testid="baseline"]'
  )

  await expect
    .poll(() => baseline.locator('[data-row-index]').count())
    .toBeLessThan(200)

  const scrollTarget = await baseline.evaluate(
    (element) => element.getBoundingClientRect().top + window.scrollY + 4000
  )
  await page.evaluate((top) => window.scrollTo(0, top), scrollTarget)

  await expect
    .poll(() =>
      baseline.evaluate((element) => {
        const first = Number(
          element
            .querySelector('[data-row-index]')
            ?.getAttribute('data-row-index')
        )
        const count = element.querySelectorAll('[data-row-index]').length
        return first > 0 && count < 200
      })
    )
    .toBe(true)

  await page.evaluate(() => window.scrollTo(0, 0))
  await expect
    .poll(() =>
      baseline.evaluate((element) =>
        Number(
          element
            .querySelector('[data-row-index]')
            ?.getAttribute('data-row-index')
        )
      )
    )
    .toBe(0)
})

test('Baseline resolves the relative sizing matrix in the browser', async ({
  page,
}) => {
  assertDimensionMatrix(await readDimensionMatrix(page, 'react-dimension'))
})

test('Config colors reach the actual Box and Spacer consumers', async ({
  page,
}) => {
  const box = page.locator('#config-box [data-testid="box"]')
  const spacer = page.locator('#config-spacer [data-testid="spacer"]')
  const baseline = page.locator('#config-baseline [data-testid="baseline"]')
  const guide = page.locator('#config-guide [data-testid="guide"]')
  const padder = page.locator('#config-padder [data-testid="padder"]')

  await expect(box).toBeVisible()
  await expect(spacer).toBeVisible()
  await expect(baseline).toBeVisible()
  await expect(guide).toBeVisible()
  await expect(padder).toBeVisible()

  await expect
    .poll(() =>
      box.evaluate((element) => element.style.getPropertyValue('--bkbx-cl'))
    )
    .toBe('#ff0000')
  await expect
    .poll(() =>
      spacer.evaluate((element) => element.style.getPropertyValue('--bksp-cf'))
    )
    .toBe('#00ff00')
  await expect
    .poll(() =>
      baseline.evaluate((element) =>
        element.style.getPropertyValue('--bkbl-cl')
      )
    )
    .toBe('#101010')
  await expect
    .poll(() =>
      guide.evaluate((element) => element.style.getPropertyValue('--bkgd-cf'))
    )
    .toBe('#606060')

  await expect
    .poll(() =>
      box.evaluate(
        (element) => getComputedStyle(element, '::after').borderTopColor
      )
    )
    .toBe('rgb(255, 0, 0)')
  await expect
    .poll(() =>
      spacer.evaluate((element) => getComputedStyle(element).backgroundColor)
    )
    .toBe('rgb(0, 255, 0)')
  await expect
    .poll(() =>
      baseline.evaluate((element) => {
        const row = element.querySelector('[data-row-index]')
        return row ? getComputedStyle(row).backgroundColor : ''
      })
    )
    .toBe('rgb(16, 16, 16)')
  await expect
    .poll(() =>
      guide.evaluate((element) => {
        const column = element.querySelector('[data-column-index]')
        return column ? getComputedStyle(column).backgroundColor : ''
      })
    )
    .toBe('rgb(96, 96, 96)')
  await expect
    .poll(() =>
      padder.evaluate(
        (element) => getComputedStyle(element, '::after').borderTopColor
      )
    )
    .toBe('rgb(112, 112, 112)')
})

test('React Box and Padder trim both text edges with ex alphabetic metrics', async ({
  page,
}) => {
  const selector =
    '#config-box [data-testid="box"], #config-box [data-testid="padder"], #config-box [data-testid="padder-content"]'

  await expect(page.locator(selector)).toHaveCount(3)
  await expect
    .poll(() => readTextBoxStyles(page, selector))
    .toEqual([
      { trim: 'trim-both', edge: 'ex alphabetic' },
      { trim: 'trim-both', edge: 'ex alphabetic' },
      { trim: 'trim-both', edge: 'ex alphabetic' },
    ])
})

test('inline paint channels override Config for Baseline and Guide', async ({
  page,
}) => {
  const baseline = page.locator(
    '#config-baseline-inline [data-testid="baseline"]'
  )
  const guide = page.locator('#config-guide-inline [data-testid="guide"]')

  await expect
    .poll(() =>
      baseline.evaluate((element) => {
        const row = element.querySelector('[data-row-index]')
        return row ? getComputedStyle(row).backgroundColor : ''
      })
    )
    .toBe('rgb(1, 2, 3)')
  await expect
    .poll(() =>
      guide.evaluate((element) => {
        const column = element.querySelector('[data-column-index]')
        return column ? getComputedStyle(column).backgroundColor : ''
      })
    )
    .toBe('rgb(1, 2, 3)')
})

test('React Guide keeps viewport dimensions and Padder snaps', async ({
  page,
}) => {
  await expect
    .poll(() =>
      page
        .locator('#guide-viewport [data-testid="guide"]')
        .evaluate((element) => {
          const rect = element.getBoundingClientRect()
          return [
            rect.width === window.innerWidth,
            rect.height === window.innerHeight,
          ]
        })
    )
    .toEqual([true, true])
  await expect
    .poll(() =>
      page
        .locator('#padder-snap [data-testid="padder"]')
        .evaluate((element) => element.getBoundingClientRect().height)
    )
    .toBe(16)
})

test.describe('native Remix adapter', () => {
  test('nested Config survives delayed application entry and generated consumers', async ({
    page,
  }) => {
    await page.goto('/remix.html?delayEntry=Forwarder')
    await page.evaluate(async () => {
      const state = window as unknown as {
        __baselineRemixReady: Promise<void>
        __baselineRemixRuntime: { flush(): void }
      }
      await state.__baselineRemixReady
      state.__baselineRemixRuntime.flush()
    })
    for (const slot of ['children', 'content']) {
      const spacer = page.locator(`#remix-entry-${slot} [data-testid="spacer"]`)
      expect(
        await spacer.evaluate((element) => ({
          height: element.getAttribute('data-height'),
          line: (element as HTMLElement).style.getPropertyValue('--bksp-cl'),
        }))
      ).toEqual({ height: '16px', line: 'blue' })
    }
  })
  for (const entry of ['Box', 'Padder']) {
    test(`nested Config survives delayed ${entry} hydration`, async ({
      page,
    }) => {
      await page.goto(`/remix.html?delayEntry=${entry}`)
      await page.evaluate(async () => {
        const state = window as unknown as {
          __baselineRemixReady: Promise<void>
          __baselineRemixRuntime: { flush(): void }
        }
        await state.__baselineRemixReady
        state.__baselineRemixRuntime.flush()
      })
      const spacer = page.locator(
        '#remix-nested-hydration [data-testid="padder-content"] [data-testid="spacer"]'
      )
      expect(
        await spacer.evaluate((element) => ({
          height: element.getAttribute('data-height'),
          line: (element as HTMLElement).style.getPropertyValue('--bksp-cl'),
        }))
      ).toEqual({ height: '16px', line: 'blue' })
    })
  }

  test('retains scoped Config across SSR hydration through app wrappers', async ({
    page,
  }) => {
    await page.goto('/remix.html')
    await page.evaluate(
      () =>
        (window as unknown as { __baselineRemixReady: Promise<void> })
          .__baselineRemixReady
    )
    const region = page.locator('#remix-wrapped-config')
    await expect(
      region.locator('[data-testid="spacer"]').first()
    ).toHaveAttribute('data-height', '12px')
    for (const [testId, property] of [
      ['box', '--bkbx-cl'],
      ['padder', '--bkpd-c'],
      ['baseline', '--bkbl-cl'],
      ['guide', '--bkgd-cf'],
      ['spacer', '--bksp-cl'],
    ]) {
      await expect
        .poll(() =>
          region
            .locator(`[data-testid="${testId}"]`)
            .first()
            .evaluate(
              (element, property) =>
                (element as HTMLElement).style.getPropertyValue(property),
              property
            )
        )
        .toBe('red')
    }
  })

  test('native Guide keeps viewport dimensions and Padder snaps', async ({
    page,
  }) => {
    await page.goto('/remix.html')
    await expect
      .poll(() =>
        page
          .locator('#remix-guide-viewport [data-testid="guide"]')
          .evaluate((element) => {
            const rect = element.getBoundingClientRect()
            return [
              rect.width === window.innerWidth,
              rect.height === window.innerHeight,
            ]
          })
      )
      .toEqual([true, true])
    await expect
      .poll(() =>
        page
          .locator('#remix-padder-snap [data-testid="padder"]')
          .evaluate((element) => element.getBoundingClientRect().height)
      )
      .toBe(16)
  })

  test('serves the native stylesheet through the app asset path', async ({
    request,
  }) => {
    const response = await request.get('/__baseline-remix.css')
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('text/css')
    expect(await response.text()).toContain('.bk-bas')
  })

  test('SSR markup remains usable without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()

    await page.goto('/remix.html')
    await expect(page.locator('#remix-ssr-content')).toHaveText(
      'Server-rendered Remix content remains available.'
    )

    const baseline = page.locator(
      '#remix-baseline-percent [data-testid="baseline"]'
    )
    const geometry = await baseline.evaluate((element) => {
      const rect = element.getBoundingClientRect()
      return { width: rect.width, height: rect.height }
    })

    expect(geometry.width).toBe(320)
    expect(geometry.height).toBe(160)
    await context.close()
  })

  test('hydrates through remix/ui and keeps native sizing and color behavior', async ({
    page,
  }) => {
    await page.goto('/remix.html')
    await page.evaluate(
      () =>
        (window as unknown as { __baselineRemixReady: Promise<void> })
          .__baselineRemixReady
    )

    const loadedModules = await page.evaluate(
      () =>
        (window as unknown as { __baselineRemixLoadedModules?: string[] })
          .__baselineRemixLoadedModules ?? []
    )
    expect(loadedModules.length).toBeGreaterThan(0)
    expect(
      loadedModules.every((entry) => entry.startsWith('/remix-module.js#'))
    ).toBe(true)

    const baseline = page.locator(
      '#remix-baseline-percent [data-testid="baseline"]'
    )
    await expect(baseline.locator('[data-row-index]')).toHaveCount(20)

    const sizing = await baseline.evaluate((element) => {
      const rect = element.getBoundingClientRect()
      return {
        height: rect.height,
        rows: element.querySelectorAll('[data-row-index]').length,
        declaredHeight: element.style.getPropertyValue('--bkbl-h'),
        declaredColor: element.style.getPropertyValue('--bkbl-cl'),
      }
    })

    expect(sizing.declaredHeight).toBe('100%')
    expect(sizing.height).toBe(160)
    expect(sizing.rows).toBe(Math.ceil(sizing.height / 8))

    const viewportBaseline = page.locator(
      '#remix-baseline-viewport [data-testid="baseline"]'
    )
    await expect(
      viewportBaseline.locator('[data-row-index]').first()
    ).toBeVisible()
    await expect
      .poll(() =>
        viewportBaseline.evaluate((element) =>
          element.style.getPropertyValue('--bkbl-h')
        )
      )
      .toBe('100vh')

    const box = page.locator('#remix-config-box [data-testid="box"]')
    const spacer = page.locator('#remix-config-spacer [data-testid="spacer"]')
    const configBaseline = page.locator(
      '#remix-config-baseline [data-testid="baseline"]'
    )
    const configGuide = page.locator(
      '#remix-config-guide [data-testid="guide"]'
    )
    const configPadder = page.locator(
      '#remix-config-padder [data-testid="padder"]'
    )
    await expect
      .poll(() =>
        box.evaluate((element) => element.style.getPropertyValue('--bkbx-cl'))
      )
      .toBe('#ff0000')
    await expect
      .poll(() =>
        spacer.evaluate((element) =>
          element.style.getPropertyValue('--bksp-cf')
        )
      )
      .toBe('#00ff00')
    await expect
      .poll(() =>
        configBaseline.evaluate((element) =>
          element.style.getPropertyValue('--bkbl-cl')
        )
      )
      .toBe('#101010')
    await expect
      .poll(() =>
        configGuide.evaluate((element) =>
          element.style.getPropertyValue('--bkgd-cf')
        )
      )
      .toBe('#606060')
    await expect
      .poll(() =>
        configPadder.evaluate(
          (element) => getComputedStyle(element, '::after').borderTopColor
        )
      )
      .toBe('rgb(112, 112, 112)')

    const textBoxSelector =
      '#remix-config-box [data-testid="box"], #remix-config-box [data-testid="padder"], #remix-config-box [data-testid="padder-content"]'
    await expect(page.locator(textBoxSelector)).toHaveCount(3)
    await expect
      .poll(() => readTextBoxStyles(page, textBoxSelector))
      .toEqual([
        { trim: 'trim-both', edge: 'ex alphabetic' },
        { trim: 'trim-both', edge: 'ex alphabetic' },
        { trim: 'trim-both', edge: 'ex alphabetic' },
      ])

    const defaultPaint = page.locator(
      '#remix-baseline-default-paint [data-testid="baseline"]'
    )
    await expect
      .poll(() =>
        defaultPaint.evaluate((element) => {
          const row = element.querySelector('[data-row-index]')
          return row ? getComputedStyle(row).backgroundColor : ''
        })
      )
      .not.toBe('rgba(0, 0, 0, 0)')

    const inlineBaseline = page.locator(
      '#remix-config-baseline-inline [data-testid="baseline"]'
    )
    const inlineGuide = page.locator(
      '#remix-config-guide-inline [data-testid="guide"]'
    )
    await expect
      .poll(() =>
        inlineBaseline.evaluate((element) => {
          const row = element.querySelector('[data-row-index]')
          return row ? getComputedStyle(row).backgroundColor : ''
        })
      )
      .toBe('rgb(1, 2, 3)')
    await expect
      .poll(() =>
        inlineGuide.evaluate((element) => {
          const column = element.querySelector('[data-column-index]')
          return column ? getComputedStyle(column).backgroundColor : ''
        })
      )
      .toBe('rgb(1, 2, 3)')
  })

  test('native Baseline resolves the relative sizing matrix in the browser', async ({
    page,
  }) => {
    await page.goto('/remix.html')
    await page.evaluate(
      () =>
        (window as unknown as { __baselineRemixReady: Promise<void> })
          .__baselineRemixReady
    )

    assertDimensionMatrix(await readDimensionMatrix(page, 'remix-dimension'))
  })

  test('native viewport sizing responds to a browser resize', async ({
    page,
  }) => {
    await page.goto('/remix.html')
    await page.evaluate(
      () =>
        (window as unknown as { __baselineRemixReady: Promise<void> })
          .__baselineRemixReady
    )

    const baseline = page.locator(
      '#remix-baseline-viewport [data-testid="baseline"]'
    )
    await page.setViewportSize({ width: 1280, height: 600 })

    await expect
      .poll(() =>
        baseline.evaluate((element) => {
          const rect = element.getBoundingClientRect()
          return {
            height: Math.round(rect.height),
            rows: element.querySelectorAll('[data-row-index]').length,
          }
        })
      )
      .toEqual({ height: 600, rows: 75 })
  })

  test('native Box applies its snapping mode after measuring content', async ({
    page,
  }) => {
    await page.goto('/remix.html')
    await page.evaluate(
      () =>
        (window as unknown as { __baselineRemixReady: Promise<void> })
          .__baselineRemixReady
    )

    await expect
      .poll(() =>
        page
          .locator('#remix-snap-box [data-testid="spacer"]')
          .evaluateAll((elements) =>
            elements.map((element) => element.getAttribute('data-height'))
          )
      )
      .toContain('6px')
  })

  test('native rows respond to a containing-block resize', async ({ page }) => {
    await page.goto('/remix.html')
    await page.evaluate(
      () =>
        (window as unknown as { __baselineRemixReady: Promise<void> })
          .__baselineRemixReady
    )

    const parent = page.locator('#remix-baseline-parent-resize')
    const baseline = parent.locator('[data-testid="baseline"]')
    await parent.evaluate((element) => {
      element.style.height = '96px'
    })

    await expect
      .poll(() =>
        baseline.evaluate((element) => ({
          height: Math.round(element.getBoundingClientRect().height),
          rows: element.querySelectorAll('[data-row-index]').length,
        }))
      )
      .toEqual({ height: 96, rows: 12 })
  })

  test('native rows respond to a root font-size change', async ({ page }) => {
    await page.goto('/remix.html')
    await page.evaluate(
      () =>
        (window as unknown as { __baselineRemixReady: Promise<void> })
          .__baselineRemixReady
    )

    const baseline = page.locator(
      '#remix-dimension-height-rem [data-testid="baseline"]'
    )
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '20px'
    })

    await expect
      .poll(() =>
        baseline.evaluate((element) => ({
          height: Math.round(element.getBoundingClientRect().height),
          rows: element.querySelectorAll('[data-row-index]').length,
        }))
      )
      .toEqual({ height: 200, rows: 25 })
  })

  test('native virtualization stays bounded while scrolling a tall fixture', async ({
    page,
  }) => {
    await page.goto('/remix.html')
    await page.evaluate(
      () =>
        (window as unknown as { __baselineRemixReady: Promise<void> })
          .__baselineRemixReady
    )

    const baseline = page.locator(
      '#remix-baseline-virtual-tall [data-testid="baseline"]'
    )
    await expect
      .poll(() => baseline.locator('[data-row-index]').count())
      .toBeLessThan(200)

    const scrollTarget = await baseline.evaluate(
      (element) => element.getBoundingClientRect().top + window.scrollY + 4000
    )
    await page.evaluate((top) => window.scrollTo(0, top), scrollTarget)

    await expect
      .poll(() =>
        baseline.evaluate((element) => {
          const first = Number(
            element
              .querySelector('[data-row-index]')
              ?.getAttribute('data-row-index')
          )
          const count = element.querySelectorAll('[data-row-index]').length
          return first > 0 && count < 200
        })
      )
      .toBe(true)

    await page.evaluate(() => window.scrollTo(0, 0))
    await expect
      .poll(() =>
        baseline.evaluate((element) =>
          Number(
            element
              .querySelector('[data-row-index]')
              ?.getAttribute('data-row-index')
          )
        )
      )
      .toBe(0)
  })

  test('owns native observers through frame reload, replacement, and remount', async ({
    page,
  }) => {
    await installNativeLifecycleProbe(page)
    await page.goto('/remix.html')
    await page.evaluate(
      () =>
        (window as unknown as { __baselineRemixReady: Promise<void> })
          .__baselineRemixReady
    )

    const baseline = await readNativeLifecycleProbe(page)
    await page.evaluate(async () => {
      const controls = (
        window as unknown as {
          __baselineRemixLifecycle: {
            reload: (src: string) => Promise<void>
          }
        }
      ).__baselineRemixLifecycle
      await controls.reload('/remix-lifecycle-a')
    })
    await expect(page.locator('#remix-frame-view-a')).toBeVisible()
    await expect(
      page.locator('#remix-frame-view-a [data-row-index]').first()
    ).toBeVisible()
    const afterReload = await readNativeLifecycleProbe(page)
    expect(afterReload.resizeActive).toBeGreaterThan(baseline.resizeActive)
    expect(afterReload.intersectionActive).toBeGreaterThan(
      baseline.intersectionActive
    )

    const detachedFrame = await page
      .locator('#remix-frame-view-a')
      .elementHandle()
    await page.evaluate(async () => {
      const controls = (
        window as unknown as {
          __baselineRemixLifecycle: {
            replace: (src: string) => Promise<void>
          }
        }
      ).__baselineRemixLifecycle
      await controls.replace('/remix-lifecycle-b')
    })
    await expect(page.locator('#remix-frame-view-b')).toBeVisible()
    expect(
      await detachedFrame?.evaluate((element) => element.isConnected)
    ).toBe(false)
    await waitForAnimationFrames(page)
    const afterReplacement = await readNativeLifecycleProbe(page)
    expect(afterReplacement.resizeActive).toBe(afterReload.resizeActive)
    expect(afterReplacement.intersectionActive).toBe(
      afterReload.intersectionActive
    )
    expect(afterReplacement.callbacksAfterDisconnect).toBe(0)

    await page.evaluate(async () => {
      const controls = (
        window as unknown as {
          __baselineRemixLifecycle: {
            replaceStatic: () => Promise<void>
          }
        }
      ).__baselineRemixLifecycle
      await controls.replaceStatic()
    })
    await expect(page.locator('#remix-frame-static')).toBeVisible()
    await waitForAnimationFrames(page)
    const afterStaticReplacement = await readNativeLifecycleProbe(page)
    expect(afterStaticReplacement.resizeActive).toBe(baseline.resizeActive)
    expect(afterStaticReplacement.intersectionActive).toBe(
      baseline.intersectionActive
    )
    expect(afterStaticReplacement.windowListeners).toBe(
      baseline.windowListeners
    )
    expect(afterStaticReplacement.callbacksAfterDisconnect).toBe(0)

    await page.evaluate(async () => {
      const controls = (
        window as unknown as {
          __baselineRemixLifecycle: {
            reload: (src: string) => Promise<void>
          }
        }
      ).__baselineRemixLifecycle
      await controls.reload('/remix-lifecycle-a')
    })
    await expect(page.locator('#remix-frame-view-a')).toBeVisible()
    const afterRemount = await readNativeLifecycleProbe(page)
    expect(afterRemount.resizeActive).toBe(afterReload.resizeActive)
    expect(afterRemount.intersectionActive).toBe(afterReload.intersectionActive)

    await page.evaluate(() => {
      const runtime = (
        window as unknown as {
          __baselineRemixRuntime: { dispose: () => void; flush: () => void }
        }
      ).__baselineRemixRuntime
      runtime.dispose()
      runtime.flush()
    })
    await waitForAnimationFrames(page)
    const afterDispose = await readNativeLifecycleProbe(page)
    expect(afterDispose.resizeActive).toBe(0)
    expect(afterDispose.intersectionActive).toBe(0)
    expect(afterDispose.windowListeners).toBe(0)
    expect(afterDispose.callbacksAfterDisconnect).toBe(0)
  })

  test('preserves native frame state across enhanced navigation and history', async ({
    page,
  }) => {
    await installNativeLifecycleProbe(page)
    await page.goto('/remix.html')
    await page.evaluate(
      () =>
        (window as unknown as { __baselineRemixReady: Promise<void> })
          .__baselineRemixReady
    )

    const supportsEnhancedNavigation = await page.evaluate(() => {
      const candidate = (
        window as unknown as {
          NavigateEvent?: { prototype?: object }
        }
      ).NavigateEvent
      return Boolean(
        'navigation' in window &&
        candidate?.prototype &&
        'sourceElement' in candidate.prototype
      )
    })
    test.skip(
      !supportsEnhancedNavigation,
      'This browser does not expose the Navigation API; direct Frame lifecycle coverage remains cross-engine.'
    )

    const baseline = await readNativeLifecycleProbe(page)
    await page.locator('#remix-frame-nav-b').click()
    await expect(page.locator('#remix-frame-view-b')).toBeVisible()
    await expect
      .poll(() => page.evaluate(() => location.pathname))
      .toBe('/remix-lifecycle-b')
    const afterNavigation = await readNativeLifecycleProbe(page)
    expect(afterNavigation.resizeActive).toBeGreaterThan(baseline.resizeActive)

    await page.evaluate(() => history.back())
    await expect
      .poll(() => page.evaluate(() => location.pathname))
      .toBe('/remix.html')
    await expect(page.locator('#remix-frame-view-a')).toBeVisible()
    const afterBack = await readNativeLifecycleProbe(page)
    expect(afterBack.resizeActive).toBe(afterNavigation.resizeActive)
    expect(afterBack.intersectionActive).toBe(
      afterNavigation.intersectionActive
    )
    expect(afterBack.windowListeners).toBe(afterNavigation.windowListeners)

    await page.evaluate(() => history.forward())
    await expect
      .poll(() => page.evaluate(() => location.pathname))
      .toBe('/remix-lifecycle-b')
    await expect(page.locator('#remix-frame-view-b')).toBeVisible()
    await expect(page.locator('[data-remix-frame-view]')).toHaveCount(1)
    const afterForward = await readNativeLifecycleProbe(page)
    expect(afterForward.resizeActive).toBe(afterNavigation.resizeActive)
    expect(afterForward.intersectionActive).toBe(
      afterNavigation.intersectionActive
    )
    expect(afterForward.windowListeners).toBe(afterNavigation.windowListeners)

    await page.evaluate(() => {
      const runtime = (
        window as unknown as {
          __baselineRemixRuntime: { dispose: () => void; flush: () => void }
        }
      ).__baselineRemixRuntime
      runtime.dispose()
      runtime.flush()
    })
    await waitForAnimationFrames(page)
    const afterDispose = await readNativeLifecycleProbe(page)
    expect(afterDispose.resizeActive).toBe(0)
    expect(afterDispose.intersectionActive).toBe(0)
    expect(afterDispose.windowListeners).toBe(0)
    expect(afterDispose.callbacksAfterDisconnect).toBe(0)
  })
})
