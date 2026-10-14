import { expect, test, type Locator, type Page } from '@playwright/test'

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

async function compareScreenshotPixels(
  page: Page,
  reference: Buffer,
  candidate: Buffer
) {
  return page.evaluate(
    async ({ referenceImage, candidateImage }) => {
      const decode = async (source: string) => {
        const image = new Image()
        image.src = `data:image/png;base64,${source}`
        await image.decode()
        const canvas = document.createElement('canvas')
        canvas.width = image.naturalWidth
        canvas.height = image.naturalHeight
        const context = canvas.getContext('2d')!
        context.drawImage(image, 0, 0)
        return {
          width: canvas.width,
          height: canvas.height,
          pixels: context.getImageData(0, 0, canvas.width, canvas.height).data,
        }
      }

      const [first, second] = await Promise.all([
        decode(referenceImage),
        decode(candidateImage),
      ])
      if (first.width !== second.width || first.height !== second.height) {
        return {
          width: second.width,
          height: second.height,
          differingPixels: -1,
          differingRows: [],
          firstMismatch: null,
        }
      }

      let differingPixels = 0
      let maxChannelDelta = 0
      const differingRows = new Set<number>()
      let firstMismatch: {
        x: number
        y: number
        reference: number[]
        candidate: number[]
      } | null = null
      for (let offset = 0; offset < first.pixels.length; offset += 4) {
        if (
          first.pixels[offset] !== second.pixels[offset] ||
          first.pixels[offset + 1] !== second.pixels[offset + 1] ||
          first.pixels[offset + 2] !== second.pixels[offset + 2] ||
          first.pixels[offset + 3] !== second.pixels[offset + 3]
        ) {
          differingPixels += 1
          const x = (offset / 4) % first.width
          const y = Math.floor(offset / (4 * first.width))
          differingRows.add(y)
          firstMismatch ??= {
            x,
            y,
            reference: Array.from(first.pixels.slice(offset, offset + 4)),
            candidate: Array.from(second.pixels.slice(offset, offset + 4)),
          }
        }
        for (let channel = 0; channel < 4; channel += 1) {
          maxChannelDelta = Math.max(
            maxChannelDelta,
            Math.abs(
              first.pixels[offset + channel] - second.pixels[offset + channel]
            )
          )
        }
      }

      return {
        width: second.width,
        height: second.height,
        differingPixels,
        maxChannelDelta,
        differingRows: Array.from(differingRows),
        firstMismatch,
      }
    },
    {
      referenceImage: reference.toString('base64'),
      candidateImage: candidate.toString('base64'),
    }
  )
}

async function captureAlignedPaintPair(
  page: Page,
  reference: Locator,
  candidate: Locator,
  referenceParent: string,
  candidateParent: string
) {
  await page.evaluate(
    ({ referenceParent, candidateParent }) => {
      for (const selector of [referenceParent, candidateParent]) {
        const parent = document.querySelector<HTMLElement>(selector)
        if (!parent) throw new Error(`Missing paint fixture: ${selector}`)
        Object.assign(parent.style, {
          position: 'fixed',
          top: '0px',
          left: '0px',
          width: '320px',
          height: '32px',
          margin: '0px',
          backgroundColor: 'white',
          opacity: '1',
          zIndex: '100000',
        })
      }
      document.querySelector<HTMLElement>(candidateParent)!.style.opacity = '0'
    },
    { referenceParent, candidateParent }
  )
  const referenceImage = await reference.screenshot({ animations: 'disabled' })

  await page.evaluate(
    ({ referenceParent, candidateParent }) => {
      document.querySelector<HTMLElement>(referenceParent)!.style.opacity = '0'
      document.querySelector<HTMLElement>(candidateParent)!.style.opacity = '1'
    },
    { referenceParent, candidateParent }
  )
  const candidateImage = await candidate.screenshot({ animations: 'disabled' })
  await page.evaluate(
    ({ referenceParent, candidateParent }) => {
      document
        .querySelector<HTMLElement>(referenceParent)!
        .style.removeProperty('opacity')
      document
        .querySelector<HTMLElement>(candidateParent)!
        .style.removeProperty('opacity')
    },
    { referenceParent, candidateParent }
  )
  return { referenceImage, candidateImage }
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
    'height-full': { height: 240, declared: '' },
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

  expect(measurements.declaredHeight).toBe('')
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

test('React fixed Guide compact paint matches its grid and stays under 360 bytes', async ({
  page,
}) => {
  const reference = page.locator('#guide-paint-reference-host')
  const compact = page.locator('#guide-paint-compact-host')
  await expect(reference.locator(':scope > div > div')).toHaveCount(4)
  await expect(compact.locator(':scope > div > div')).toHaveCount(0)

  const { referenceImage, candidateImage } = await captureAlignedPaintPair(
    page,
    reference,
    compact,
    '#guide-paint-reference',
    '#guide-paint-compact'
  )

  const geometry = await page.evaluate(() => {
    const reference = document.querySelector<HTMLElement>(
      '#guide-paint-reference-host'
    )!
    const compact = document.querySelector<HTMLElement>(
      '#guide-paint-compact-host'
    )!
    const tracks = Array.from(reference.firstElementChild!.children).map(
      (track) => {
        const rect = track.getBoundingClientRect()
        return { left: rect.left, width: rect.width, height: rect.height }
      }
    )
    const compactRect = compact.firstElementChild!.getBoundingClientRect()
    compact.removeAttribute('id')
    return {
      tracks,
      compact: {
        left: compactRect.left,
        width: compactRect.width,
        height: compactRect.height,
      },
      bytes: new TextEncoder().encode(compact.outerHTML).length,
    }
  })
  expect(geometry.bytes).toBeLessThanOrEqual(360)
  expect(geometry.tracks).toHaveLength(4)
  expect(geometry.compact.left).toBeCloseTo(geometry.tracks[0].left, 1)
  expect(geometry.compact.width).toBeCloseTo(
    geometry.tracks.reduce((sum, track) => sum + track.width, 0),
    1
  )
  expect(geometry.compact.height).toBeCloseTo(geometry.tracks[0].height, 1)

  const parity = await compareScreenshotPixels(
    page,
    referenceImage,
    candidateImage
  )
  expect(parity.maxChannelDelta).toBe(0)
})

test('zero-padding Box and Padder omit empty helper nodes without diagnostics', async ({
  page,
}) => {
  const box = page.locator('#zero-padding-box')
  const padder = page.locator('#zero-padding-padder')
  await expect(box).not.toHaveAttribute('data-testid')
  await expect(padder).not.toHaveAttribute('data-testid')

  const structure = await page.evaluate(() => {
    const box = document.querySelector('#zero-padding-box')!
    const padder = document.querySelector('#zero-padding-padder')!
    return {
      boxDescendants: box.querySelectorAll('*').length,
      boxChildKeepsContentHost:
        box.querySelector('#zero-padding-box-child')?.parentElement
          ?.parentElement === box,
      padderDescendants: padder.querySelectorAll('*').length,
      padderChildKeepsContentHost:
        padder.querySelector('#zero-padding-padder-child')?.parentElement !==
        padder,
    }
  })

  expect(structure).toEqual({
    boxDescendants: 2,
    boxChildKeepsContentHost: true,
    padderDescendants: 2,
    padderChildKeepsContentHost: true,
  })
  await expect(box).toHaveClass(/box/)
  await expect(padder).toHaveClass(/pad/)
})

test('Padder keeps one-sided spacing on the requested grid edge', async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const measure = (hostId: string, childId: string) => {
      const host = document.getElementById(hostId)!.getBoundingClientRect()
      const child = document.getElementById(childId)!.getBoundingClientRect()
      const spacer = document
        .getElementById(hostId)!
        .querySelector('[class*="spr_"], .bk-spr')!
        .getBoundingClientRect()
      return {
        childLeft: child.left - host.left,
        childTop: child.top - host.top,
        spacerRight: host.right - spacer.right,
        spacerBottom: host.bottom - spacer.bottom,
        spacerWidth: spacer.width,
        spacerHeight: spacer.height,
      }
    }
    return {
      rightOnly: measure('right-only-padder', 'right-only-content'),
      bottomOnly: measure('bottom-only-padder', 'bottom-only-content'),
    }
  })

  expect(result.rightOnly.childLeft).toBeCloseTo(0, 1)
  expect(result.rightOnly.spacerRight).toBeCloseTo(0, 1)
  expect(result.rightOnly.spacerWidth).toBeCloseTo(24, 1)
  expect(result.bottomOnly.childTop).toBeCloseTo(0, 1)
  expect(result.bottomOnly.spacerBottom).toBeCloseTo(0, 1)
  expect(result.bottomOnly.spacerHeight).toBeCloseTo(24, 1)
})

test('Box preserves caller display styles through the nested Padder fallback', async ({
  page,
}) => {
  const result = await page.locator('#caller-layout-box').evaluate((box) => {
    const padder = box.firstElementChild as HTMLElement | null
    return {
      boxDisplay: getComputedStyle(box).display,
      padderDisplay: padder ? getComputedStyle(padder).display : null,
      boxChildren: box.childElementCount,
      paddingSpacers: padder?.querySelectorAll(
        ':scope > div > [data-testid="spacer"]'
      ).length,
      boxPadderOutline: getComputedStyle(box, '::before').borderTopWidth,
      padderOutline: padder
        ? getComputedStyle(padder, '::after').borderTopWidth
        : null,
      childConnected: Boolean(box.querySelector('#caller-layout-box-child')),
    }
  })

  expect(result).toEqual({
    boxDisplay: 'flex',
    padderDisplay: 'grid',
    boxChildren: 1,
    paddingSpacers: 2,
    boxPadderOutline: '0px',
    padderOutline: '1px',
    childConnected: true,
  })
})

test('Box preserves caller width and height styles on the nested Padder path', async ({
  page,
}) => {
  const box = page.locator('#box-inline-size-fallback')
  await expect(box).toHaveCSS('height', '32px')
  expect(
    await box.evaluate(
      (element) =>
        getComputedStyle(element).width ===
        getComputedStyle(element.parentElement!).width
    )
  ).toBe(true)
  await expect(box.locator(':scope > [data-testid="padder"]')).toHaveCount(1)
})

test('Box visible diagnostics paint both outlines on the compact host', async ({
  page,
}) => {
  const box = page.locator('#box-visible-debug-fallback')
  await expect(box).toHaveAttribute('data-testid', 'box')
  await expect(box.locator(':scope > [data-testid="padder"]')).toHaveCount(0)
  expect(
    await box.evaluate((element) => ({
      children: element.childElementCount,
      boxOutline: getComputedStyle(element, '::after').borderTopWidth,
      padderOutline: getComputedStyle(element, '::before').borderTopWidth,
    }))
  ).toEqual({ children: 1, boxOutline: '1px', padderOutline: '1px' })
})

test('Box keeps child identity, value, and focus while visible diagnostics turn off', async ({
  page,
}) => {
  for (const id of ['box-debug-merged', 'box-debug-separated']) {
    const host = page.locator(`#${id}-host`)
    const child = page.locator(`#${id}-child`)
    const childHandle = await child.elementHandle()

    await expect(host.locator(':scope > [data-testid="padder"]')).toHaveCount(
      id === 'box-debug-separated' ? 1 : 0
    )
    await child.fill(`${id} value`)
    await child.focus()
    expect(
      await childHandle?.evaluate(
        (element) => element === document.activeElement
      )
    ).toBe(true)

    for (const mode of ['hidden', 'none'] as const) {
      await page.locator(`#${id}-toggle`).evaluate((button) => {
        ;(button as HTMLButtonElement).click()
      })

      expect(
        await childHandle?.evaluate((element) => element.isConnected)
      ).toBe(true)
      expect(
        await childHandle?.evaluate(
          (element) => element === document.activeElement
        )
      ).toBe(true)
      await expect(child).toHaveValue(`${id} value`)
      await expect(host.locator(':scope > [data-testid="padder"]')).toHaveCount(
        id === 'box-debug-separated' ? 1 : 0
      )
    }
  }
})

test('Box host merge preserves the nested Padder grid geometry', async ({
  page,
}) => {
  const reference = page.locator('#box-merge-reference-host')
  const candidate = page.locator('#box-merge-candidate-host')
  const geometry = await page.evaluate(() => {
    const reference = document.querySelector<HTMLElement>(
      '#box-merge-reference-host'
    )!
    const candidate = document.querySelector<HTMLElement>(
      '#box-merge-candidate-host'
    )!
    const rect = (element: Element) => {
      const value = element.getBoundingClientRect()
      return {
        left: value.left,
        top: value.top,
        width: value.width,
        height: value.height,
      }
    }
    const relativeRect = (element: Element, host: Element) => {
      const value = rect(element)
      const origin = rect(host)
      return {
        ...value,
        left: value.left - origin.left,
        top: value.top - origin.top,
      }
    }
    const referenceContent = reference.querySelector(
      '#box-merge-reference-child'
    )!.parentElement!
    const candidateContent = candidate.querySelector(
      '#box-merge-candidate-child'
    )!.parentElement!
    return {
      reference: {
        host: rect(reference),
        content: relativeRect(referenceContent, reference),
        child: relativeRect(
          document.querySelector('#box-merge-reference-child')!,
          reference
        ),
      },
      candidate: {
        host: rect(candidate),
        content: relativeRect(candidateContent, candidate),
        child: relativeRect(
          document.querySelector('#box-merge-candidate-child')!,
          candidate
        ),
      },
    }
  })
  expect(geometry.candidate.host.width).toBe(geometry.reference.host.width)
  expect(geometry.candidate.host.height).toBe(geometry.reference.host.height)
  expect(geometry.candidate.content).toEqual(geometry.reference.content)
  expect(geometry.candidate.child).toEqual(geometry.reference.child)
  expect(
    await candidate.evaluate(
      (element) =>
        element.querySelector('#box-merge-candidate-child')?.parentElement
          ?.parentElement === element
    )
  ).toBe(true)
  expect(
    await candidate.evaluate((element) => element.querySelectorAll('*').length)
  ).toBeLessThan(
    await reference.evaluate((element) => element.querySelectorAll('*').length)
  )
})

test('Box keeps its content host and child mounted as diagnostics toggle', async ({
  page,
}) => {
  const host = page.locator('#box-diagnostics-host')
  const child = page.locator('#box-diagnostics-child')
  const childHandle = await child.elementHandle()

  await expect(host).toHaveAttribute('data-testid', 'box')
  await expect(host.locator('[data-testid="padder-content"]')).toHaveCount(1)
  await child.click()
  await expect(child).toHaveText('Box clicks 1')
  // WebKit removes keyboard focus after mouse activation of a button. Focus it
  // again here so the following assertion isolates the snapping update.
  await child.focus()
  expect(
    await childHandle?.evaluate((element) => element === document.activeElement)
  ).toBe(true)
  await page.locator('#box-diagnostics-toggle').click()
  await expect(host).not.toHaveAttribute('data-testid')
  expect(await childHandle?.evaluate((element) => element.isConnected)).toBe(
    true
  )
  await child.click()
  await expect(child).toHaveText('Box clicks 2')
})

test('Padder keeps the same child mounted as diagnostics toggle', async ({
  page,
}) => {
  const host = page.locator('#padder-diagnostics-host')
  const child = page.locator('#padder-diagnostics-child')
  const childHandle = await child.elementHandle()

  await expect(host).toHaveAttribute('data-testid', 'padder')
  await child.click()
  await expect(child).toHaveText('Clicks 1')
  await page.locator('#padder-diagnostics-toggle').click()
  await expect(host).not.toHaveAttribute('data-testid')
  expect(await childHandle?.evaluate((element) => element.isConnected)).toBe(
    true
  )
  await child.click()
  await expect(child).toHaveText('Clicks 2')
})

test('Box keeps its stateful child mounted when snapped padding appears', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = Element.prototype.getBoundingClientRect
    let allowMeasurement = false
    ;(
      window as typeof window & { __allowBoxSnapMeasurement?: () => void }
    ).__allowBoxSnapMeasurement = () => {
      allowMeasurement = true
    }
    Element.prototype.getBoundingClientRect = function () {
      if (
        !allowMeasurement &&
        (this as HTMLElement).id === 'box-snap-stateful-host'
      ) {
        return new DOMRect(0, 0, 0, 0)
      }
      return original.call(this)
    }
  })
  await page.reload()

  const child = page.locator('#box-snap-stateful-child')
  const childHandle = await child.elementHandle()
  const host = page.locator('#box-snap-stateful-host')
  const spacers = page.locator('#box-snap-stateful-host [data-testid="spacer"]')
  await expect(spacers).toHaveCount(0)
  const initialRows = await host.evaluate((element) => {
    const content = getComputedStyle(
      element.querySelector(':scope > .bk-pad-content')!
    )
    return `${content.marginTop} ${content.marginBottom}`
  })
  await child.focus()
  expect(
    await child.evaluate((element) => element === document.activeElement)
  ).toBe(true)
  await child.click()
  await expect(child).toHaveText('Box clicks 1')
  // Isolate focus retention during the snapping update from WebKit's mouse
  // activation policy for buttons.
  await child.focus()
  expect(
    await childHandle?.evaluate((element) => element === document.activeElement)
  ).toBe(true)

  await page.evaluate(() => {
    ;(
      window as typeof window & { __allowBoxSnapMeasurement: () => void }
    ).__allowBoxSnapMeasurement()
  })
  await page
    .locator('#box-snap-expand-content')
    .evaluate((element: HTMLButtonElement) =>
      element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    )
  await expect(spacers).toHaveCount(0)
  // The snapped padding lands a frame or more after the content grows.
  await expect
    .poll(() =>
      host.evaluate((element) => {
        const content = getComputedStyle(
          element.querySelector(':scope > .bk-pad-content')!
        )
        return `${content.marginTop} ${content.marginBottom}`
      })
    )
    .not.toBe(initialRows)
  expect(await childHandle?.evaluate((element) => element.isConnected)).toBe(
    true
  )
  expect(
    await childHandle?.evaluate((element) => element === document.activeElement)
  ).toBe(true)
  await child.click()
  await expect(child).toHaveText('Box clicks 2')
})

test('Baseline CSS paint keeps fractional rows as the fallback', async ({
  page,
}) => {
  for (const variant of ['line', 'flat', 'fractional']) {
    const reference = page.locator(`#baseline-reference-host-${variant}`)
    const compact = page.locator(`#baseline-compact-host-${variant}`)
    await expect(reference.locator('[data-row-index]').first()).toBeVisible()
    await expect(compact.locator('[data-row-index]')).toHaveCount(0)
    await expect(compact).not.toHaveAttribute('data-testid')
    if (variant === 'fractional') {
      await expect(compact).not.toHaveClass(/compact/)
      expect(
        await compact.evaluate((element) => element.childElementCount)
      ).toBeGreaterThan(0)
    } else {
      await expect(compact).toHaveClass(/compact/)
      expect(
        await compact.evaluate((element) => element.childElementCount)
      ).toBe(0)
    }

    const { referenceImage, candidateImage } = await captureAlignedPaintPair(
      page,
      reference,
      compact,
      `#baseline-reference-${variant}`,
      `#baseline-compact-${variant}`
    )
    const parity = await compareScreenshotPixels(
      page,
      referenceImage,
      candidateImage
    )
    expect(parity.maxChannelDelta).toBeLessThanOrEqual(1)
  }
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
  await expect
    .poll(() =>
      box.evaluate(
        (element) => getComputedStyle(element, '::before').borderTopColor
      )
    )
    .toBe('rgb(112, 112, 112)')
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
    '#config-box [data-testid="box"], #config-box [data-testid="padder-content"]'

  await expect(page.locator(selector)).toHaveCount(2)
  await expect
    .poll(() => readTextBoxStyles(page, selector))
    .toEqual([
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

test('React Box applies top-edge snapping on its merged grid host', async ({
  page,
}) => {
  const box = page.locator('#box-snap-top [data-testid="box"]')
  await expect
    .poll(() =>
      box.evaluate(
        (element) =>
          getComputedStyle(element.querySelector(':scope > .bk-pad-content')!)
            .marginTop
      )
    )
    .toBe('6px')
  await expect(box.locator(':scope > [data-testid="padder"]')).toHaveCount(0)
})

test('React caller classes win and only Box trims its children', async ({
  page,
}) => {
  await expect(page.locator('#caller-class-box')).toHaveCSS('display', 'flex')
  const trim = await page.evaluate(() => ({
    supported: CSS.supports('text-box-trim', 'trim-both'),
    box: getComputedStyle(
      document.querySelector('#trim-box p')!
    ).getPropertyValue('text-box-trim'),
    padder: getComputedStyle(
      document.querySelector('#trim-padder p')!
    ).getPropertyValue('text-box-trim'),
    padderNone: getComputedStyle(
      document.querySelector('#trim-padder-none p')!
    ).getPropertyValue('text-box-trim'),
  }))
  if (trim.supported) {
    expect(trim.box).toBe('trim-both')
    expect(trim.padder).toBe('none')
    expect(trim.padderNone).toBe('none')
  }
})

test('React Padder spacers keep a snapped Padder on the base grid', async ({
  page,
}) => {
  for (const id of ['#grid-padder']) {
    await expect
      .poll(() =>
        page.locator(id).evaluate((element) => {
          const remainder = element.getBoundingClientRect().height % 8
          return Math.min(remainder, 8 - remainder) < 1 / 64
        })
      )
      .toBe(true)
  }
})

test('React nested and semantic Boxes stay on the grid', async ({ page }) => {
  // Every top-level Box in the section starts and ends on the grid: a nested
  // Box adds no late correction, and semantic hosts carry no default margins.
  await expect
    .poll(() =>
      page.locator('#nested-snap').evaluate((section) => {
        const origin = section.getBoundingClientRect().top
        const off = (value: number) => {
          const remainder = (((value - origin) % 8) + 8) % 8
          return Math.min(remainder, 8 - remainder)
        }
        return Array.from(section.children).map((element) => {
          const rect = element.getBoundingClientRect()
          return Math.max(off(rect.top), off(rect.bottom)) < 1 / 64
        })
      })
    )
    .toEqual([true, true, true, true])
})

test('React Box stays on the grid under CSS zoom and snaps one layout unit', async ({
  page,
}) => {
  // Under CSS zoom the Box snaps in unzoomed px, within the 1/32px residue
  // a scaled layout can leave (WebKit on Linux leaves 1/64px) and without
  // an extra row; at 1x a one-layout-unit remainder is snapped exactly.
  await expect
    .poll(() =>
      page.evaluate(() => {
        const cssZoom = (element: Element) => {
          // currentCSSZoom, or the product of each ancestor's zoom where it is
          // missing (WebKit on Linux), as getCSSZoom does.
          const own = (element as Element & { currentCSSZoom?: number })
            .currentCSSZoom
          if (own) return own
          let zoom = 1
          for (
            let node: Element | null = element;
            node;
            node = node.parentElement
          ) {
            zoom *= parseFloat(getComputedStyle(node).zoom) || 1
          }
          return zoom
        }
        const zoomed = document.querySelector('#precision-zoom')!
        const unit = document.querySelector('#precision-unit')!
        const cssHeight =
          zoomed.getBoundingClientRect().height / cssZoom(zoomed)
        return [
          Math.abs(cssHeight - 16) <= 1 / 32,
          unit.getBoundingClientRect().height,
        ]
      })
    )
    .toEqual([true, 16])
})

test('React Box re-snaps late content and keeps caller margins', async ({
  page,
}) => {
  const box = page.locator('#late-box')
  await expect
    .poll(() =>
      box.evaluate((element) => element.getBoundingClientRect().height)
    )
    .toBe(16)
  // Content grows after the first snap (a web font loading, say): the Box
  // re-snaps from its natural height without a remount.
  await page.evaluate(() => {
    ;(document.querySelector('#late-content') as HTMLElement).style.height =
      '17px'
  })
  await expect
    .poll(() =>
      box.evaluate((element) => element.getBoundingClientRect().height)
    )
    .toBe(24)
  // Element resets such as normalize.css don't add margins to a semantic
  // host, but a caller's own class still sets one.
  await expect(page.locator('#reset-p')).toHaveCSS('margin-top', '0px')
  await expect(page.locator('#caller-p')).toHaveCSS('margin-top', '16px')
})

test('React Box re-snaps a content change long after its snap', async ({
  page,
}) => {
  const box = page.locator('#late-box')
  const height = () =>
    box.evaluate((element) => element.getBoundingClientRect().height)
  await expect.poll(height).toBe(16)
  // Seconds after the snap (a late web font, say), a size change alone
  // re-snaps it.
  await page.waitForTimeout(3000)
  await page.evaluate(() => {
    ;(document.querySelector('#late-content') as HTMLElement).style.height =
      '17px'
  })
  await expect.poll(height).toBe(24)
})

test('React Box re-snaps after snapping turns off and back on', async ({
  page,
}) => {
  const probe = page.locator('#mode-probe')
  const height = () =>
    probe.evaluate((element) => element.getBoundingClientRect().height)
  const set = (next: { mode?: 'clamp' | 'none'; height?: number }) =>
    page.evaluate(
      (value) =>
        (
          window as unknown as {
            __setSnapProbe: (next: typeof value) => void
          }
        ).__setSnapProbe(value),
      next
    )
  await expect.poll(height).toBe(104)
  // Re-snap to an aligned height without correction.
  await set({ height: 88 })
  await expect.poll(height).toBe(88)
  await set({ mode: 'none' })
  await set({ height: 100 })
  await expect.poll(height).toBe(100)
  // Back to the same mode, base and padding: it must snap afresh.
  await set({ mode: 'clamp' })
  await expect.poll(height).toBe(104)
})

test('React Box re-snaps when props change right after a snap', async ({
  page,
}) => {
  await expect
    .poll(() =>
      page
        .locator('#props-after-snap')
        .evaluate((element) => element.getBoundingClientRect().height % 8)
    )
    .toBe(0)
})

test('React Box snaps a padding change made in a mount effect', async ({
  page,
}) => {
  await expect
    .poll(() =>
      page
        .locator('#mount-flip-probe')
        .evaluate((element) => element.getBoundingClientRect().height)
    )
    .toBe(104)
})

test('React Box keeps snapping after its as prop changes', async ({ page }) => {
  const probe = page.locator('#as-probe')
  const height = () =>
    probe.evaluate((element) => element.getBoundingClientRect().height)
  const set = (next: { as?: 'p' | 'h2'; height?: number }) =>
    page.evaluate(
      (value) =>
        (
          window as unknown as {
            __setAsProbe: (next: typeof value) => void
          }
        ).__setAsProbe(value),
      next
    )
  await expect.poll(height).toBe(104)
  await set({ as: 'h2' })
  await expect(page.locator('h2#as-probe')).toHaveCount(1)
  // The new host is measured, so changed content re-snaps.
  await set({ height: 88 })
  await expect.poll(height).toBe(88)
})

test('React Box keeps a fractional top snap on an 8px base', async ({
  page,
}) => {
  const box = page.locator('#box-snap-top-fractional [data-testid="box"]')
  await expect
    .poll(() =>
      box.evaluate(
        (element) =>
          getComputedStyle(element.querySelector(':scope > .bk-pad-content')!)
            .marginTop
      )
    )
    .toBe('5.5px')
  const height = await box.evaluate(
    (element) => element.getBoundingClientRect().height
  )
  expect(height % 8).toBeCloseTo(0, 5)
})

test('React semantic Box sizes once and snaps its whole host', async ({
  page,
}) => {
  const host = page.locator('#react-semantic-sized')
  expect(await host.evaluate((element) => element.tagName)).toBe('H3')
  await expect
    .poll(() =>
      host.evaluate((element) => {
        const remainder = element.getBoundingClientRect().height % 8
        return Math.min(remainder, 8 - remainder) < 1 / 64
      })
    )
    .toBe(true)
  const sizes = await host.evaluate((element) => ({
    host: element.getBoundingClientRect().width,
    grid: element
      .querySelector(':scope > .bk-box__grid')!
      .getBoundingClientRect().width,
  }))
  expect(sizes.host).toBeCloseTo(200, 1)
  expect(sizes.grid).toBeCloseTo(200, 1)

  const label = page.locator('#react-semantic-label')
  expect(await label.evaluate((element) => element.tagName)).toBe('LABEL')
  await expect(label).toHaveAttribute('for', 'react-semantic-input')
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
        '#remix-nested-hydration [data-testid="spacer"]'
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

  test('native fixed Guide compact paint matches its grid and stays under 360 bytes', async ({
    page,
  }) => {
    await page.goto('/remix.html')
    await page.evaluate(
      () =>
        (window as unknown as { __baselineRemixReady: Promise<void> })
          .__baselineRemixReady
    )

    const reference = page.locator('#remix-guide-paint-reference-host')
    const compact = page.locator('#remix-guide-paint-compact-host')
    await expect(reference.locator(':scope > div > div')).toHaveCount(4)
    await expect(compact.locator(':scope > div > div')).toHaveCount(0)

    const { referenceImage, candidateImage } = await captureAlignedPaintPair(
      page,
      reference,
      compact,
      '#remix-guide-paint-reference',
      '#remix-guide-paint-compact'
    )

    const geometry = await page.evaluate(() => {
      const reference = document.querySelector<HTMLElement>(
        '#remix-guide-paint-reference-host'
      )!
      const compact = document.querySelector<HTMLElement>(
        '#remix-guide-paint-compact-host'
      )!
      const tracks = Array.from(reference.firstElementChild!.children).map(
        (track) => {
          const rect = track.getBoundingClientRect()
          return { left: rect.left, width: rect.width, height: rect.height }
        }
      )
      const compactRect = compact.firstElementChild!.getBoundingClientRect()
      compact.removeAttribute('id')
      return {
        tracks,
        compact: {
          left: compactRect.left,
          width: compactRect.width,
          height: compactRect.height,
        },
        bytes: new TextEncoder().encode(compact.outerHTML).length,
      }
    })
    expect(geometry.bytes).toBeLessThanOrEqual(360)
    expect(geometry.tracks).toHaveLength(4)
    expect(geometry.compact.left).toBeCloseTo(geometry.tracks[0].left, 1)
    expect(geometry.compact.width).toBeCloseTo(
      geometry.tracks.reduce((sum, track) => sum + track.width, 0),
      1
    )
    expect(geometry.compact.height).toBeCloseTo(geometry.tracks[0].height, 1)

    const parity = await compareScreenshotPixels(
      page,
      referenceImage,
      candidateImage
    )
    expect(parity.maxChannelDelta).toBe(0)
  })

  test('serves the shared stylesheet through the app asset path', async ({
    request,
  }) => {
    const response = await request.get('/__baseline.css')
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

  test('hydrates through remix/component and keeps native sizing and color behavior', async ({
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

    expect(sizing.declaredHeight).toBe('')
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
        box.evaluate(
          (element) => getComputedStyle(element, '::before').borderTopColor
        )
      )
      .toBe('rgb(112, 112, 112)')
    await expect(box.locator(':scope > [data-testid="padder"]')).toHaveCount(0)
    await expect
      .poll(() =>
        box.evaluate(
          (element) => getComputedStyle(element, '::after').borderTopColor
        )
      )
      .toBe('rgb(255, 0, 0)')
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
      '#remix-config-box [data-testid="box"], #remix-config-box [data-testid="padder-content"]'
    await expect(page.locator(textBoxSelector)).toHaveCount(2)
    await expect
      .poll(() => readTextBoxStyles(page, textBoxSelector))
      .toEqual([
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

  test('native zero-padding Box and Padder keep only needed elements', async ({
    page,
  }) => {
    await page.goto('/remix.html')
    await page.evaluate(
      () =>
        (window as unknown as { __baselineRemixReady: Promise<void> })
          .__baselineRemixReady
    )

    const structure = await page.evaluate(() => {
      const box = document.querySelector('#remix-zero-padding-box')!
      const padder = document.querySelector('#remix-zero-padding-padder')!
      return {
        boxDescendants: box.querySelectorAll('*').length,
        boxChildKeepsContentHost:
          box.querySelector('#remix-zero-padding-box-child')?.parentElement
            ?.parentElement === box,
        padderDescendants: padder.querySelectorAll('*').length,
        padderChildKeepsContentHost:
          padder.querySelector('#remix-zero-padding-padder-child')
            ?.parentElement !== padder,
      }
    })

    expect(structure).toEqual({
      boxDescendants: 2,
      boxChildKeepsContentHost: true,
      padderDescendants: 2,
      padderChildKeepsContentHost: true,
    })
    await expect(
      page.locator('#remix-zero-padding-padder')
    ).not.toHaveAttribute('data-testid')
    await expect(page.locator('#remix-zero-padding-box')).not.toHaveAttribute(
      'data-testid'
    )
    await expect(page.locator('#remix-zero-padding-padder')).toHaveClass(
      /bk-pad/
    )
  })

  test('native Padder keeps one-sided spacing on the requested grid edge', async ({
    page,
  }) => {
    await page.goto('/remix.html')
    await page.evaluate(
      () =>
        (window as unknown as { __baselineRemixReady: Promise<void> })
          .__baselineRemixReady
    )

    const result = await page.evaluate(() => {
      const measure = (hostId: string, childId: string) => {
        const host = document.getElementById(hostId)!.getBoundingClientRect()
        const child = document.getElementById(childId)!.getBoundingClientRect()
        const spacer = document
          .getElementById(hostId)!
          .querySelector('.bk-spr')!
          .getBoundingClientRect()
        return {
          childLeft: child.left - host.left,
          childTop: child.top - host.top,
          spacerRight: host.right - spacer.right,
          spacerBottom: host.bottom - spacer.bottom,
          spacerWidth: spacer.width,
          spacerHeight: spacer.height,
        }
      }
      return {
        rightOnly: measure(
          'remix-right-only-padder',
          'remix-right-only-content'
        ),
        bottomOnly: measure(
          'remix-bottom-only-padder',
          'remix-bottom-only-content'
        ),
      }
    })

    expect(result.rightOnly.childLeft).toBeCloseTo(0, 1)
    expect(result.rightOnly.spacerRight).toBeCloseTo(0, 1)
    expect(result.rightOnly.spacerWidth).toBeCloseTo(24, 1)
    expect(result.bottomOnly.childTop).toBeCloseTo(0, 1)
    expect(result.bottomOnly.spacerBottom).toBeCloseTo(0, 1)
    expect(result.bottomOnly.spacerHeight).toBeCloseTo(24, 1)
  })

  test('native Box preserves caller display styles through the nested Padder fallback', async ({
    page,
  }) => {
    await page.goto('/remix.html')
    await page.evaluate(
      () =>
        (window as unknown as { __baselineRemixReady: Promise<void> })
          .__baselineRemixReady
    )

    const result = await page
      .locator('#remix-caller-layout-box')
      .evaluate((box) => {
        const padder = box.firstElementChild as HTMLElement | null
        return {
          boxDisplay: getComputedStyle(box).display,
          padderDisplay: padder ? getComputedStyle(padder).display : null,
          boxChildren: box.childElementCount,
          paddingSpacers: padder?.querySelectorAll(
            ':scope > div > [data-testid="spacer"]'
          ).length,
          boxPadderOutline: getComputedStyle(box, '::before').borderTopWidth,
          padderOutline: padder
            ? getComputedStyle(padder, '::after').borderTopWidth
            : null,
          childConnected: Boolean(
            box.querySelector('#remix-caller-layout-box-child')
          ),
        }
      })

    expect(result).toEqual({
      boxDisplay: 'flex',
      padderDisplay: 'grid',
      boxChildren: 1,
      paddingSpacers: 2,
      boxPadderOutline: '0px',
      padderOutline: '1px',
      childConnected: true,
    })
  })

  test('native Baseline CSS paint keeps fractional rows as the fallback', async ({
    page,
  }) => {
    await page.goto('/remix.html')
    await page.evaluate(
      () =>
        (window as unknown as { __baselineRemixReady: Promise<void> })
          .__baselineRemixReady
    )

    for (const variant of ['line', 'flat', 'fractional']) {
      const reference = page.locator(
        `#remix-baseline-reference-host-${variant}`
      )
      const compact = page.locator(`#remix-baseline-compact-host-${variant}`)
      await expect(reference.locator('[data-row-index]').first()).toBeVisible()
      await expect(compact.locator('[data-row-index]')).toHaveCount(0)
      await expect(compact).not.toHaveAttribute('data-testid')
      if (variant === 'fractional') {
        await expect(compact).not.toHaveClass(/bk-compact/)
        expect(
          await compact.evaluate((element) => element.childElementCount)
        ).toBeGreaterThan(0)
      } else {
        await expect(compact).toHaveClass(/bk-compact/)
        expect(
          await compact.evaluate((element) => element.childElementCount)
        ).toBe(0)
      }

      const { referenceImage, candidateImage } = await captureAlignedPaintPair(
        page,
        reference,
        compact,
        `#remix-baseline-reference-${variant}`,
        `#remix-baseline-compact-${variant}`
      )
      const parity = await compareScreenshotPixels(
        page,
        referenceImage,
        candidateImage
      )
      expect(parity.maxChannelDelta).toBeLessThanOrEqual(1)
    }
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
          .locator('#remix-snap-box [data-testid="box"]')
          .evaluate((element) => {
            const content = getComputedStyle(
              element.querySelector(':scope > .bk-pad-content')!
            )
            return `${content.marginTop} ${content.marginBottom}`
          })
      )
      .toContain('6px')
  })

  test('native Box applies top-edge snapping on its merged grid host', async ({
    page,
  }) => {
    await page.goto('/remix.html')
    await page.evaluate(
      () =>
        (window as unknown as { __baselineRemixReady: Promise<void> })
          .__baselineRemixReady
    )

    const box = page.locator('#remix-snap-box-top [data-testid="box"]')
    await expect
      .poll(() =>
        box.evaluate(
          (element) =>
            getComputedStyle(element.querySelector(':scope > .bk-pad-content')!)
              .marginTop
        )
      )
      .toBe('6px')
    await expect(box).toHaveAttribute('data-bk-snap-state', 'measured')
    await expect(box.locator(':scope > [data-testid="padder"]')).toHaveCount(0)
  })

  test('native Box preserves semantic hosts and applies top-edge snapping', async ({
    page,
  }) => {
    await page.goto('/remix.html')
    await page.evaluate(
      () =>
        (window as unknown as { __baselineRemixReady: Promise<void> })
          .__baselineRemixReady
    )

    const heading = page.locator('#remix-semantic-heading')
    expect(await heading.evaluate((element) => element.tagName)).toBe('H2')
    await expect(heading).toHaveCSS('display', 'flex')
    const semanticGrid = heading.locator(':scope > .bk-box__grid')
    await expect
      .poll(() =>
        semanticGrid.evaluate((element) =>
          Number.parseFloat(
            getComputedStyle(element.querySelector(':scope > .bk-pad-content')!)
              .marginTop
          )
        )
      )
      .toBeGreaterThan(0)
    await expect
      .poll(() =>
        semanticGrid.evaluate((element) =>
          Number.parseFloat(
            getComputedStyle(element.querySelector(':scope > .bk-pad-content')!)
              .marginTop
          )
        )
      )
      .toBeLessThan(8)

    const label = page.locator('#remix-semantic-label')
    expect(await label.evaluate((element) => element.tagName)).toBe('LABEL')
    await expect(label).toHaveAttribute('for', 'remix-semantic-input')
  })

  test('native caller classes win and only Box trims its children', async ({
    page,
  }) => {
    await page.goto('/remix.html')
    await page.evaluate(
      () =>
        (window as unknown as { __baselineRemixReady: Promise<void> })
          .__baselineRemixReady
    )
    await expect(page.locator('#remix-caller-class-box')).toHaveCSS(
      'display',
      'flex'
    )
    const trim = await page.evaluate(() => ({
      supported: CSS.supports('text-box-trim', 'trim-both'),
      box: getComputedStyle(
        document.querySelector('#remix-trim-box p')!
      ).getPropertyValue('text-box-trim'),
      padder: getComputedStyle(
        document.querySelector('#remix-trim-padder p')!
      ).getPropertyValue('text-box-trim'),
      padderNone: getComputedStyle(
        document.querySelector('#remix-trim-padder-none p')!
      ).getPropertyValue('text-box-trim'),
    }))
    if (trim.supported) {
      expect(trim.box).toBe('trim-both')
      expect(trim.padder).toBe('none')
      expect(trim.padderNone).toBe('none')
    }
  })

  test('native Padder spacers keep a snapped Padder on the base grid', async ({
    page,
  }) => {
    await page.goto('/remix.html')
    await page.evaluate(
      () =>
        (window as unknown as { __baselineRemixReady: Promise<void> })
          .__baselineRemixReady
    )
    for (const id of ['#remix-grid-padder']) {
      await expect
        .poll(() =>
          page.locator(id).evaluate((element) => {
            const remainder = element.getBoundingClientRect().height % 8
            return Math.min(remainder, 8 - remainder) < 1 / 64
          })
        )
        .toBe(true)
    }
  })

  test('native components keep measuring after a temporary detach', async ({
    page,
  }) => {
    await page.goto('/remix.html')
    await page.evaluate(
      () =>
        (window as unknown as { __baselineRemixReady: Promise<void> })
          .__baselineRemixReady
    )
    const guide = page.locator('#remix-detach-host [data-testid="guide"]')
    const columns = () =>
      guide.evaluate((element) =>
        (element as HTMLElement).style.getPropertyValue('--bkgd-n')
      )
    await expect.poll(columns).toBe('4')

    await page.evaluate(async () => {
      const host = document.querySelector('#remix-detach-host')!
      const parent = host.parentNode!
      const next = host.nextSibling
      host.remove()
      for (let frame = 0; frame < 4; frame += 1) {
        await new Promise((resolve) => requestAnimationFrame(resolve))
      }
      parent.insertBefore(host, next)
      ;(host as HTMLElement).style.width = '600px'
    })
    await expect.poll(columns).toBe('6')
  })

  test('native nested and semantic Boxes stay on the grid', async ({
    page,
  }) => {
    await page.goto('/remix.html')
    await page.evaluate(
      () =>
        (window as unknown as { __baselineRemixReady: Promise<void> })
          .__baselineRemixReady
    )
    // Every top-level Box in the section starts and ends on the grid: a nested
    // Box adds no late correction, and semantic hosts carry no default margins.
    await expect
      .poll(() =>
        page.locator('#remix-nested-snap').evaluate((section) => {
          const origin = section.getBoundingClientRect().top
          const off = (value: number) => {
            const remainder = (((value - origin) % 8) + 8) % 8
            return Math.min(remainder, 8 - remainder)
          }
          return Array.from(section.children).map((element) => {
            const rect = element.getBoundingClientRect()
            return Math.max(off(rect.top), off(rect.bottom)) < 1 / 64
          })
        })
      )
      .toEqual([true, true, true, true])
  })

  test('native components keep measuring when detached during another unmount', async ({
    page,
  }) => {
    await page.goto('/remix.html')
    await page.evaluate(
      () =>
        (window as unknown as { __baselineRemixReady: Promise<void> })
          .__baselineRemixReady
    )
    const guide = page.locator('#remix-detach-host [data-testid="guide"]')
    const columns = () =>
      guide.evaluate((element) =>
        (element as HTMLElement).style.getPropertyValue('--bkgd-n')
      )
    await expect.poll(columns).toBe('4')
    // Load a frame view whose measured entries the replacement will unmount.
    await page.evaluate(() =>
      (
        window as unknown as {
          __baselineRemixLifecycle: { reload: (src: string) => Promise<void> }
        }
      ).__baselineRemixLifecycle.reload('/remix-lifecycle-a')
    )
    await expect(
      page.locator('#remix-frame-view-a [data-row-index]').first()
    ).toBeVisible()

    await page.evaluate(async () => {
      const host = document.querySelector('#remix-detach-host')!
      const parent = host.parentNode!
      const next = host.nextSibling
      host.remove()
      // Unmounting the frame's entries runs the detach sweep meanwhile.
      await (
        window as unknown as {
          __baselineRemixLifecycle: { replaceStatic: () => Promise<void> }
        }
      ).__baselineRemixLifecycle.replaceStatic()
      for (let frame = 0; frame < 3; frame += 1) {
        await new Promise((resolve) => requestAnimationFrame(resolve))
      }
      parent.insertBefore(host, next)
      ;(host as HTMLElement).style.width = '600px'
    })
    await expect.poll(columns).toBe('6')
  })

  test('native Box stays on the grid under CSS zoom and snaps one layout unit', async ({
    page,
  }) => {
    await page.goto('/remix.html')
    await page.evaluate(
      () =>
        (window as unknown as { __baselineRemixReady: Promise<void> })
          .__baselineRemixReady
    )
    // Under CSS zoom the Box snaps in unzoomed px, within the 1/32px residue
    // a scaled layout can leave (WebKit on Linux leaves 1/64px) and without
    // an extra row; at 1x a one-layout-unit remainder is snapped exactly.
    await expect
      .poll(() =>
        page.evaluate(() => {
          const cssZoom = (element: Element) => {
            // currentCSSZoom, or the product of each ancestor's zoom where it is
            // missing (WebKit on Linux), as getCSSZoom does.
            const own = (element as Element & { currentCSSZoom?: number })
              .currentCSSZoom
            if (own) return own
            let zoom = 1
            for (
              let node: Element | null = element;
              node;
              node = node.parentElement
            ) {
              zoom *= parseFloat(getComputedStyle(node).zoom) || 1
            }
            return zoom
          }
          const zoomed = document.querySelector('#remix-precision-zoom')!
          const unit = document.querySelector('#remix-precision-unit')!
          const cssHeight =
            zoomed.getBoundingClientRect().height / cssZoom(zoomed)
          return [
            Math.abs(cssHeight - 16) <= 1 / 32,
            unit.getBoundingClientRect().height,
          ]
        })
      )
      .toEqual([true, 16])
  })

  test('native Box re-snaps late content and keeps caller margins', async ({
    page,
  }) => {
    await page.goto('/remix.html')
    await page.evaluate(
      () =>
        (window as unknown as { __baselineRemixReady: Promise<void> })
          .__baselineRemixReady
    )
    const box = page.locator('#remix-late-box')
    await expect
      .poll(() =>
        box.evaluate((element) => element.getBoundingClientRect().height)
      )
      .toBe(16)
    // Content grows after the first snap (a web font loading, say): the Box
    // re-snaps from its natural height without a remount.
    await page.evaluate(() => {
      ;(
        document.querySelector('#remix-late-content') as HTMLElement
      ).style.height = '17px'
    })
    await expect
      .poll(() =>
        box.evaluate((element) => element.getBoundingClientRect().height)
      )
      .toBe(24)
    // Element resets such as normalize.css don't add margins to a semantic
    // host, but a caller's own class still sets one.
    await expect(page.locator('#remix-reset-p')).toHaveCSS('margin-top', '0px')
    await expect(page.locator('#remix-caller-p')).toHaveCSS(
      'margin-top',
      '16px'
    )
  })

  test('native Box re-snaps a content change long after its snap', async ({
    page,
  }) => {
    await page.goto('/remix.html')
    await page.evaluate(
      () =>
        (window as unknown as { __baselineRemixReady: Promise<void> })
          .__baselineRemixReady
    )
    const box = page.locator('#remix-late-box')
    const height = () =>
      box.evaluate((element) => element.getBoundingClientRect().height)
    await expect.poll(height).toBe(16)
    // Seconds after the snap (a late web font, say), a size change alone
    // re-snaps it.
    await page.waitForTimeout(3000)
    await page.evaluate(() => {
      ;(
        document.querySelector('#remix-late-content') as HTMLElement
      ).style.height = '17px'
    })
    await expect.poll(height).toBe(24)
  })

  test('native Box re-snaps after snapping turns off and back on', async ({
    page,
  }) => {
    await page.goto('/remix.html')
    await page.evaluate(
      () =>
        (window as unknown as { __baselineRemixReady: Promise<void> })
          .__baselineRemixReady
    )
    const probe = page.locator('#remix-mode-probe')
    const height = () =>
      probe.evaluate((element) => element.getBoundingClientRect().height)
    const set = (next: { mode?: 'clamp' | 'none'; height?: number }) =>
      page.evaluate(
        (value) =>
          (
            window as unknown as {
              __setRemixSnapProbe: (next: typeof value) => void
            }
          ).__setRemixSnapProbe(value),
        next
      )
    await expect.poll(height).toBe(104)
    // Re-snap to an aligned height without correction.
    await set({ height: 88 })
    await expect.poll(height).toBe(88)
    await set({ mode: 'none' })
    await set({ height: 100 })
    await expect.poll(height).toBe(100)
    // Back to the same mode, base and padding: it must snap afresh.
    await set({ mode: 'clamp' })
    await expect.poll(height).toBe(104)
  })

  test('native Box keeps a fractional top snap on an 8px base', async ({
    page,
  }) => {
    await page.goto('/remix.html')
    await page.evaluate(
      () =>
        (window as unknown as { __baselineRemixReady: Promise<void> })
          .__baselineRemixReady
    )
    const box = page.locator(
      '#remix-snap-box-top-fractional [data-testid="box"]'
    )
    await expect
      .poll(() =>
        box.evaluate(
          (element) =>
            getComputedStyle(element.querySelector(':scope > .bk-pad-content')!)
              .marginTop
        )
      )
      .toBe('5.5px')
    const height = await box.evaluate(
      (element) => element.getBoundingClientRect().height
    )
    expect(height % 8).toBeCloseTo(0, 5)
  })

  test('native semantic Box sizes once and snaps its whole host', async ({
    page,
  }) => {
    await page.goto('/remix.html')
    await page.evaluate(
      () =>
        (window as unknown as { __baselineRemixReady: Promise<void> })
          .__baselineRemixReady
    )

    const host = page.locator('#remix-semantic-sized')
    await expect(host).toHaveAttribute('data-bk-snap-state', 'measured')
    const sizes = await host.evaluate((element) => {
      const grid = element.querySelector(':scope > .bk-box__grid')!
      return {
        host: element.getBoundingClientRect(),
        grid: grid.getBoundingClientRect(),
      }
    })
    // width="50%" applies to the host only, not again to the inner grid.
    expect(sizes.host.width).toBeCloseTo(200, 1)
    expect(sizes.grid.width).toBeCloseTo(200, 1)
    // The host's own border and padding count toward the snapped height.
    const remainder = sizes.host.height % 8
    expect(Math.min(remainder, 8 - remainder)).toBeLessThan(1 / 64)
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
    // Entries nested in a non-measuring entry are released by the detach
    // sweep once they have stayed out of the document for half a second.
    await expect
      .poll(async () => {
        const afterDispose = await readNativeLifecycleProbe(page)
        return [
          afterDispose.resizeActive,
          afterDispose.intersectionActive,
          afterDispose.windowListeners,
          afterDispose.callbacksAfterDisconnect,
        ]
      })
      .toEqual([0, 0, 0, 0])
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
    // Remix can briefly render a nested entry into a detached element during
    // history navigation; its bridge releases itself within a few frames.
    await expect
      .poll(async () => {
        const afterBack = await readNativeLifecycleProbe(page)
        return [
          afterBack.resizeActive,
          afterBack.intersectionActive,
          afterBack.windowListeners,
        ]
      })
      .toEqual([
        afterNavigation.resizeActive,
        afterNavigation.intersectionActive,
        afterNavigation.windowListeners,
      ])

    await page.evaluate(() => history.forward())
    await expect
      .poll(() => page.evaluate(() => location.pathname))
      .toBe('/remix-lifecycle-b')
    await expect(page.locator('#remix-frame-view-b')).toBeVisible()
    await expect(page.locator('[data-remix-frame-view]')).toHaveCount(1)
    // Remix can briefly render a nested entry into a detached element during
    // history navigation; its bridge releases itself within a few frames.
    await expect
      .poll(async () => {
        const afterForward = await readNativeLifecycleProbe(page)
        return [
          afterForward.resizeActive,
          afterForward.intersectionActive,
          afterForward.windowListeners,
        ]
      })
      .toEqual([
        afterNavigation.resizeActive,
        afterNavigation.intersectionActive,
        afterNavigation.windowListeners,
      ])

    await page.evaluate(() => {
      const runtime = (
        window as unknown as {
          __baselineRemixRuntime: { dispose: () => void; flush: () => void }
        }
      ).__baselineRemixRuntime
      runtime.dispose()
      runtime.flush()
    })
    // Entries nested in a non-measuring entry are released by the detach
    // sweep once they have stayed out of the document for half a second.
    await expect
      .poll(async () => {
        const afterDispose = await readNativeLifecycleProbe(page)
        return [
          afterDispose.resizeActive,
          afterDispose.intersectionActive,
          afterDispose.windowListeners,
          afterDispose.callbacksAfterDisconnect,
        ]
      })
      .toEqual([0, 0, 0, 0])
  })
})

// Live grid (7.1): Boxes follow every size change. Hosts are tagged by
// `data-live` (see LiveGridFixture). Distance of each content-driven host's
// height from the 8px grid, in CSS px.
async function liveGridOffsets(page: Page, root: string) {
  return page.evaluate((selector) => {
    const off = (element: Element) => {
      const height = element.getBoundingClientRect().height
      const remainder = ((height % 8) + 8) % 8
      return Math.min(remainder, 8 - remainder)
    }
    return Array.from(
      document.querySelectorAll(`${selector} [data-live="box"]`),
      off
    )
  }, root)
}

/** Heights of the content-driven and fixed hosts, in document order. */
async function liveGridHeights(page: Page, root: string) {
  return page.evaluate(
    (selector) =>
      Array.from(
        document.querySelectorAll(
          `${selector} :is([data-live="box"], [data-live="nested"], [data-live="zoom"], [data-live="transition"], [data-live="fixed"])`
        ),
        (element) => {
          let zoom = (element as Element & { currentCSSZoom?: number })
            .currentCSSZoom
          if (!zoom) {
            // WebKit on Linux lacks currentCSSZoom (see getCSSZoom).
            zoom = 1
            for (
              let node: Element | null = element;
              node;
              node = node.parentElement
            ) {
              zoom *= parseFloat(getComputedStyle(node).zoom) || 1
            }
          }
          return element.getBoundingClientRect().height / zoom
        }
      ),
    root
  )
}

async function openLiveGrid(page: Page, url: string, root: string) {
  await page.goto(url)
  if (url.startsWith('/remix.html')) {
    await page.evaluate(
      () =>
        (window as unknown as { __baselineRemixReady: Promise<void> })
          .__baselineRemixReady
    )
  }
  await expect(page.locator(`${root} [data-live="box"]`)).toHaveCount(54)
  await expect
    .poll(async () => Math.max(...(await liveGridOffsets(page, root))))
    .toBeLessThanOrEqual(1 / 64)
}

/**
 * Waits past 7.0's two-second settle window, applies `change`, then counts
 * frames until every content-driven host is on the grid.
 */
async function framesToGrid(
  page: Page,
  root: string,
  change: string,
  tolerance = 1 / 64
) {
  await page.waitForTimeout(2500)
  return page.evaluate(
    async ({ selector, change, tolerance }) => {
      const hosts = Array.from(
        document.querySelectorAll<HTMLElement>(`${selector} [data-live="box"]`)
      )
      const off = (element: Element) => {
        const height = element.getBoundingClientRect().height
        const remainder = ((height % 8) + 8) % 8
        return Math.min(remainder, 8 - remainder)
      }
      const before = hosts.map((host) => host.getBoundingClientRect().height)
      new Function(change)()
      for (let frame = 1; frame <= 60; frame++) {
        await new Promise((resolve) => requestAnimationFrame(resolve))
        const changed = hosts.some(
          (host, index) =>
            Math.abs(host.getBoundingClientRect().height - before[index]) > 0.5
        )
        if (changed && hosts.every((host) => off(host) <= tolerance)) {
          return frame
        }
      }
      return -1
    },
    { selector: root, change, tolerance }
  )
}

/**
 * Resizes the live grid through 20 widths. Per step and per group, counts the
 * frames in which each host's padding changed (a style change or a spacer
 * added or removed anywhere inside it), and how far from the grid the
 * content-driven hosts end. Then watches 30 idle frames for any change.
 */
async function liveGridStability(page: Page, root: string, tolerance: number) {
  return page.evaluate(
    async ({ selector, tolerance }) => {
      const frame = () =>
        new Promise((resolve) => requestAnimationFrame(resolve))
      const container = document.querySelector<HTMLElement>(selector)!
      const group = (name: string) =>
        Array.from(
          container.querySelectorAll<HTMLElement>(`[data-live="${name}"]`)
        )
      const groups = {
        box: group('box'),
        nested: group('nested'),
        zoom: group('zoom'),
        transition: group('transition'),
        floor: group('floor'),
        fixed: group('fixed'),
      }
      // Nested hosts (a Box inside a Padder) count for themselves only.
      const hosts = Object.values(groups).flat()
      const owner = (node: Node) => {
        let element: Element | null =
          node instanceof Element ? node : node.parentElement
        while (element && !hosts.includes(element as HTMLElement)) {
          element = element.parentElement
        }
        return element as HTMLElement | null
      }
      let frameNumber = 0
      const updates = new Map(hosts.map((host) => [host, new Set<number>()]))
      const observer = new MutationObserver((records) => {
        for (const record of records) {
          if (
            record.type === 'attributes' &&
            record.oldValue === (record.target as Element).getAttribute('style')
          ) {
            continue
          }
          const host = owner(record.target)
          if (host) updates.get(host)!.add(frameNumber)
        }
      })
      observer.observe(container, {
        attributes: true,
        attributeFilter: ['style'],
        attributeOldValue: true,
        childList: true,
        subtree: true,
      })
      const cssZoom = (element: Element) => {
        // currentCSSZoom, or the product of each ancestor's zoom where it is
        // missing (WebKit on Linux), as getCSSZoom does.
        const own = (element as Element & { currentCSSZoom?: number })
          .currentCSSZoom
        if (own) return own
        let zoom = 1
        for (
          let node: Element | null = element;
          node;
          node = node.parentElement
        ) {
          zoom *= parseFloat(getComputedStyle(node).zoom) || 1
        }
        return zoom
      }
      const zoomed = (element: Element) =>
        element.getBoundingClientRect().height / cssZoom(element)
      const off = (element: Element) => {
        const remainder = ((zoomed(element) % 8) + 8) % 8
        return Math.min(remainder, 8 - remainder)
      }
      const onGrid = () =>
        [...groups.box, ...groups.nested, ...groups.transition].every(
          (host) => off(host) <= tolerance
        ) && groups.zoom.every((host) => off(host) <= 1 / 32)
      const total = () =>
        [...updates.values()].reduce((sum, set) => sum + set.size, 0)
      const most = (members: HTMLElement[]) =>
        Math.max(0, ...members.map((host) => updates.get(host)!.size))
      const settle = async () => {
        let quiet = 0
        for (let count = 1; count <= 90; count++) {
          const before = total()
          frameNumber++
          await frame()
          quiet = total() === before ? quiet + 1 : 0
          if (quiet >= 5 && onGrid()) return count
        }
        return -1
      }
      const exact = () =>
        container.querySelector('[data-live-exact]')!.getBoundingClientRect()
          .height
      const initial = await settle()
      const exactInitial = exact()
      const widths = [
        300, 420, 333, 387, 360, 311, 405, 360, 352, 368, 300, 420, 333, 387,
        360, 311, 405, 360, 352, 368,
      ]
      const steps = []
      for (const width of widths) {
        updates.forEach((set) => set.clear())
        container.style.width = `${width}px`
        const frames = await settle()
        steps.push({
          width,
          frames,
          box: most(groups.box),
          nested: most(groups.nested),
          zoom: most(groups.zoom),
          transition: most(groups.transition),
          floor: most(groups.floor),
          fixed: most(groups.fixed),
          // Which hosts updated more than once, for the failure message.
          over: hosts
            .filter((host) => updates.get(host)!.size > 1)
            .map(
              (host) =>
                `${host.dataset.live}#${hosts.indexOf(host)} ${host.className} [${[...updates.get(host)!].join(',')}]`
            ),
          worst: Math.max(
            ...[...groups.box, ...groups.nested, ...groups.transition].map(off)
          ),
        })
      }
      updates.forEach((set) => set.clear())
      const heights = () => hosts.map(zoomed).join()
      const idleStart = heights()
      let idleHeightChanges = 0
      for (let count = 0; count < 30; count++) {
        frameNumber++
        await frame()
        if (heights() !== idleStart) idleHeightChanges++
      }
      const idleUpdates = total()
      observer.disconnect()
      return {
        initial,
        steps,
        idleUpdates,
        idleHeightChanges,
        exact: [exactInitial, exact()],
      }
    },
    { selector: root, tolerance }
  )
}

function expectStable(
  result: Awaited<ReturnType<typeof liveGridStability>>,
  tolerance: number
) {
  expect(result.initial, 'initial layout settles').toBeGreaterThan(0)
  for (const step of result.steps) {
    const at = `width ${step.width}`
    expect(step.frames, `${at} settles`).toBeGreaterThan(0)
    expect(
      step.box,
      `${at} Box updates ${step.over.join('; ')}`
    ).toBeLessThanOrEqual(1)
    // A host around another snapping host re-snaps after it.
    expect(step.nested, `${at} nested updates`).toBeLessThanOrEqual(2)
    expect(step.zoom, `${at} zoomed Box updates`).toBeLessThanOrEqual(1)
    expect(step.transition, `${at} transition updates`).toBeLessThanOrEqual(1)
    expect(step.floor, `${at} floor updates`).toBeLessThanOrEqual(3)
    expect(step.fixed, `${at} fixed-height updates`).toBe(0)
    expect(step.worst, `${at} grid`).toBeLessThanOrEqual(tolerance)
  }
  expect(result.idleUpdates, 'updates once sizes stop changing').toBe(0)
  expect(result.idleHeightChanges, 'height changes once idle').toBe(0)
  // 96px of content under a 99px floor lands on the next grid line.
  expect(result.exact, '96px under a 99px floor').toEqual([104, 104])
}

/** The resized layout matches a fresh load at the final width (368px). */
async function expectHistoryFree(
  page: Page,
  url: string,
  root: string,
  tolerance: number
) {
  const resized = await liveGridHeights(page, root)
  const fresh = await page.context().newPage()
  try {
    await openLiveGrid(fresh, `${url}&liveWidth=368`, root)
    await expect
      .poll(async () => {
        const loaded = await liveGridHeights(fresh, root)
        return loaded.every(
          (height, index) => Math.abs(height - resized[index]) <= tolerance
        )
      })
      .toBe(true)
  } finally {
    await fresh.close()
  }
}

function liveGridTests(prefix: string, url: string, root: string) {
  test(`${prefix} live grid re-snaps after a root font size change`, async ({
    page,
  }) => {
    await openLiveGrid(page, url, root)
    const frames = await framesToGrid(
      page,
      root,
      "document.documentElement.style.fontSize = '20px'"
    )
    expect(frames).toBeGreaterThan(0)
    expect(frames).toBeLessThanOrEqual(10)
  })

  test(`${prefix} live grid re-snaps a font prop change without a key`, async ({
    page,
  }) => {
    await openLiveGrid(page, url, root)
    const frames = await framesToGrid(
      page,
      root,
      "window.__setLiveFont({ size: 1.2, family: 'monospace' })"
    )
    expect(frames).toBeGreaterThan(0)
    expect(frames).toBeLessThanOrEqual(10)
  })

  test(`${prefix} live grid re-snaps when a resize rewraps text`, async ({
    page,
  }) => {
    await openLiveGrid(page, url, root)
    const frames = await framesToGrid(
      page,
      root,
      `document.querySelector('${root}').style.width = '300px'`
    )
    expect(frames).toBeGreaterThan(0)
    expect(frames).toBeLessThanOrEqual(10)
  })

  test(`${prefix} live grid updates each Box at most once per resize`, async ({
    page,
  }) => {
    await openLiveGrid(page, url, root)
    expectStable(await liveGridStability(page, root, 1 / 64), 1 / 64)
    await expectHistoryFree(page, url, root, 1 / 64)
  })

  test(`${prefix} live grid ends where it started when content toggles every few frames`, async ({
    page,
  }) => {
    await openLiveGrid(page, url, root)
    const heights = await page.evaluate(async (selector) => {
      const frame = () =>
        new Promise((resolve) => requestAnimationFrame(resolve))
      const content = document.querySelector<HTMLElement>(
        `${selector} [data-live-toggle]`
      )!
      for (let toggle = 0; toggle < 10; toggle++) {
        for (const height of ['9px', '10px']) {
          content.style.height = height
          for (let count = 0; count < 4; count++) await frame()
        }
      }
      for (let count = 0; count < 10; count++) await frame()
      const height = (name: string) =>
        document
          .querySelector(`${selector} [data-live="${name}"]`)!
          .getBoundingClientRect().height
      return [height('toggle'), height('toggle-twin')]
    }, root)
    expect(heights).toEqual([16, 16])
  })

  test(`${prefix} live grid settles a padding transition to zero`, async ({
    page,
  }) => {
    await openLiveGrid(page, url, root)
    const host = page.locator(`${root} [data-live="transition-zero"]`)
    await expect
      .poll(() =>
        host.evaluate((element) => element.getBoundingClientRect().height)
      )
      .toBe(16)
    const result = await page.evaluate(async (selector) => {
      const frame = () =>
        new Promise((resolve) => requestAnimationFrame(resolve))
      const host = document.querySelector(
        `${selector} [data-live="transition-zero"]`
      )!
      const content = host.querySelector<HTMLElement>('[data-live-zero]')!
      let updates = 0
      // Count padding changes only, not the content change below.
      const observer = new MutationObserver((records) => {
        updates += records.filter(
          (record) =>
            record.target !== content &&
            (record.type === 'childList' ||
              record.oldValue !==
                (record.target as Element).getAttribute('style'))
        ).length
      })
      observer.observe(host, {
        attributes: true,
        attributeFilter: ['style'],
        attributeOldValue: true,
        childList: true,
        subtree: true,
      })
      // 16px of content needs no padding: the 3px eases out over 120ms.
      content.style.height = '16px'
      for (let count = 0; count < 40; count++) await frame()
      observer.disconnect()
      return { height: host.getBoundingClientRect().height, updates }
    }, root)
    // One padding update (3px -> none); the transition adds no more.
    expect(result).toEqual({ height: 16, updates: 1 })
  })

  test(`${prefix} live grid snaps once per content change under every transition scope`, async ({
    page,
  }) => {
    await openLiveGrid(page, url, root)
    const result = await page.evaluate(async (selector) => {
      const frame = () =>
        new Promise((resolve) => requestAnimationFrame(resolve))
      const hosts = Array.from(
        document.querySelectorAll<HTMLElement>(
          `${selector} [data-live="scope"]`
        )
      )
      const contents = hosts.map((host) =>
        host.querySelector<HTMLElement>('[data-scope-content]')!
      )
      let frameNumber = 0
      const updates = new Map(hosts.map((host) => [host, new Set<number>()]))
      // Frames in which a host's padding changed, not its content.
      const observer = new MutationObserver((records) => {
        for (const record of records) {
          if (contents.includes(record.target as HTMLElement)) continue
          if (
            record.type === 'attributes' &&
            record.oldValue === (record.target as Element).getAttribute('style')
          ) {
            continue
          }
          const host = hosts.find((candidate) =>
            candidate.contains(record.target)
          )
          if (host) updates.get(host)!.add(frameNumber)
        }
      })
      observer.observe(document.querySelector(selector)!, {
        attributes: true,
        attributeFilter: ['style'],
        attributeOldValue: true,
        childList: true,
        subtree: true,
      })
      const frames = async (count: number) => {
        for (let index = 0; index < count; index++) {
          frameNumber++
          await frame()
        }
      }
      // These hosts may still be making their first snap: wait for 10 quiet
      // frames before changing their content.
      const total = () =>
        [...updates.values()].reduce((sum, set) => sum + set.size, 0)
      for (let quiet = 0, count = 0; quiet < 10 && count < 120; count++) {
        const before = total()
        await frames(1)
        quiet = total() === before ? quiet + 1 : 0
      }
      const changes = []
      for (const height of ['22px', '9px', '13px']) {
        updates.forEach((set) => set.clear())
        for (const content of contents) content.style.height = height
        await frames(40)
        changes.push(hosts.map((host) => updates.get(host)!.size))
      }
      updates.forEach((set) => set.clear())
      await frames(60)
      observer.disconnect()
      const off = (host: Element) => {
        const height = host.getBoundingClientRect().height
        const remainder = ((height % 8) + 8) % 8
        return Math.min(remainder, 8 - remainder)
      }
      return {
        labels: hosts.map(
          (host) =>
            `${host.closest<HTMLElement>('[data-live-scope]')!.dataset.liveScope} ${host.className}`
        ),
        changes,
        quiet: hosts.map((host) => updates.get(host)!.size),
        off: hosts.map(off),
      }
    }, root)
    const over = (counts: number[], most: number) =>
      result.labels.filter((_, index) => counts[index] > most)
    result.changes.forEach((counts, change) => {
      expect(over(counts, 1), `change ${change}: more than one update`).toEqual(
        []
      )
    })
    expect(over(result.quiet, 0), 'updates once content stops').toEqual([])
    expect(
      result.labels.filter((_, index) => result.off[index] > 1 / 64),
      'hosts off the grid'
    ).toEqual([])
  })

  test(`${prefix} live grid stays still at a 1.25 display scale`, async ({
    browserName,
    playwright,
  }, testInfo) => {
    test.skip(browserName !== 'chromium', 'forced device scale is Chromium')
    const browser = await playwright.chromium.launch({
      args: ['--force-device-scale-factor=1.25'],
    })
    try {
      // The project's emulated deviceScaleFactor would otherwise be merged
      // in; the real 1.25 scale comes from the launch flag.
      const context = await browser.newContext({
        viewport: null,
        deviceScaleFactor: undefined,
        isMobile: undefined,
        hasTouch: undefined,
        baseURL: testInfo.project.use.baseURL,
      })
      const page = await context.newPage()
      await page.goto(url)
      expect(await page.evaluate(() => devicePixelRatio)).toBe(1.25)
      if (url.startsWith('/remix.html')) {
        await page.evaluate(
          () =>
            (window as unknown as { __baselineRemixReady: Promise<void> })
              .__baselineRemixReady
        )
      }
      await expect(page.locator(`${root} [data-live="box"]`)).toHaveCount(54)
      expectStable(await liveGridStability(page, root, 1 / 32), 1 / 32)
      await expectHistoryFree(page, url, root, 1 / 32)
    } finally {
      await browser.close()
    }
  })
}

/**
 * Where the `?remgrid` text sits on a grid of `base` px from the section top:
 * `baselines` is the largest spread, within one Box, of its line baselines
 * (marker tops) around one offset from the grid lines (the offset of a
 * baseline in its line box depends on the font size, so it is per Box);
 * `hosts` is the largest distance of a Box bottom from a grid line, which
 * also puts the next Box's first line box on the grid. Self-contained so the
 * page can run it.
 */
function measureRemGrid({ kind, base }: { kind: 'rem' | 'px'; base: number }) {
  const section = document.querySelector(`[data-rem-grid="${kind}"]`)!
  const origin = section.getBoundingClientRect().top
  const phase = (y: number) => (((y - origin) % base) + base) % base
  const apart = (a: number, b: number) => {
    const distance = Math.abs(a - b) % base
    return Math.min(distance, base - distance)
  }
  const hosts = Array.from(section.querySelectorAll('[data-rem="box"]'))
  let baselines = 0
  for (const host of hosts) {
    const tops = Array.from(host.querySelectorAll('[data-rem-mark]'), (mark) =>
      phase(mark.getBoundingClientRect().top)
    )
    baselines = Math.max(baselines, ...tops.map((top) => apart(top, tops[0])))
  }
  return {
    minLines: Math.min(
      ...hosts.map(
        (host) =>
          new Set(
            Array.from(host.querySelectorAll('[data-rem-mark]'), (mark) =>
              Math.round(mark.getBoundingClientRect().top)
            )
          ).size
      )
    ),
    baselines,
    hosts: Math.max(
      ...hosts.map((host) =>
        apart(phase(host.getBoundingClientRect().bottom), 0)
      )
    ),
    spacer: section
      .querySelector('[data-rem="spacer"]')!
      .getAttribute('data-height'),
  }
}

async function remGridState(page: Page) {
  const root = await page.evaluate(() =>
    parseFloat(getComputedStyle(document.documentElement).fontSize)
  )
  return {
    root,
    rem: await page.evaluate(measureRemGrid, { kind: 'rem', base: root / 2 }),
    px: await page.evaluate(measureRemGrid, { kind: 'px', base: 8 }),
  }
}

async function openRemGrid(page: Page, url: string) {
  await page.goto(url)
  if (url.startsWith('/remix.html')) {
    await page.evaluate(
      () =>
        (window as unknown as { __baselineRemixReady: Promise<void> })
          .__baselineRemixReady
    )
  }
  await expect(page.locator('[data-rem-grid] [data-rem="box"]')).toHaveCount(12)
}

const onRemGrid = (state: Awaited<ReturnType<typeof remGridState>>) =>
  state.rem.baselines <= 1 / 64 && state.rem.hosts <= 1 / 64

function remGridTests(prefix: string, url: string) {
  test(`${prefix} rem base follows the reader's default font size`, async ({
    page,
    browserName,
  }) => {
    // Only Chromium sets a page's default font size from a test. A second,
    // separately launched Firefox with font prefs failed to composite while
    // the gate's own Firefox ran, so it is not part of the gate.
    test.skip(browserName !== 'chromium', 'sets the default font size by CDP')
    const onGridAt = async (size: number) => {
      await expect
        .poll(async () => onRemGrid(await remGridState(page)))
        .toBe(true)
      const state = await remGridState(page)
      expect(state.root).toBe(size)
      expect(state.rem.spacer).toBe(`${Math.round(40 / size) * (size / 2)}px`)
    }
    // Chromium's own font size setting, as the reader would change it;
    // `?root=medium` makes the root that default size.
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('Page.setFontSizes', { fontSizes: { standard: 20 } })
    await openRemGrid(page, `${url}&root=medium`)
    await onGridAt(20)
    await cdp.send('Page.setFontSizes', { fontSizes: { standard: 24 } })
    await onGridAt(24)
  })

  test(`${prefix} rem base keeps every line on the grid at 16, 17, 20 and 24px roots`, async ({
    page,
  }) => {
    for (const root of [16, 17, 20, 24]) {
      await openRemGrid(page, `${url}&root=${root}`)
      await expect
        .poll(async () => {
          const state = await remGridState(page)
          return onRemGrid(state) && state.px.hosts <= 1 / 64
        })
        .toBe(true)
      const state = await remGridState(page)
      expect(state.root).toBe(root)
      // Two or more lines in every Box.
      expect(state.rem.minLines).toBeGreaterThanOrEqual(2)
      // The Spacer rounds 20px to the live base.
      expect(state.rem.spacer).toBe(`${Math.round(40 / root) * (root / 2)}px`)
      // Control: px Boxes still end on their 8px grid, but 1.5rem lines drift
      // off it once the root is not 16px.
      expect(state.px.hosts).toBeLessThanOrEqual(1 / 64)
      if (root === 16) expect(state.px.baselines).toBeLessThanOrEqual(1 / 64)
      else expect(state.px.baselines).toBeGreaterThan(1)
    }
  })

  test(`${prefix} rem base follows live root font size changes`, async ({
    page,
  }) => {
    await openRemGrid(page, `${url}&root=16`)
    await expect
      .poll(async () => onRemGrid(await remGridState(page)))
      .toBe(true)
    for (const root of [17, 20, 24, 16]) {
      const { frame: frames, last } = await page.evaluate(
        async ({ size, measure }) => {
          const measureGrid = new Function(`return ${measure}`)() as (args: {
            kind: string
            base: number
          }) => { baselines: number; hosts: number }
          const marks = Array.from(
            document.querySelectorAll('[data-rem-grid="rem"] [data-rem-mark]')
          )
          const before = marks.map((mark) => mark.getBoundingClientRect().top)
          let last: unknown = null
          document.documentElement.style.fontSize = `${size}px`
          for (let frame = 1; frame <= 60; frame++) {
            await new Promise((resolve) => requestAnimationFrame(resolve))
            const moved = marks.some(
              (mark, index) =>
                Math.abs(mark.getBoundingClientRect().top - before[index]) > 0.5
            )
            last = measureGrid({ kind: 'rem', base: size / 2 })
            if (moved && last.baselines <= 1 / 64 && last.hosts <= 1 / 64) {
              return { frame, last }
            }
          }
          return { frame: -1, last }
        },
        { size: root, measure: measureRemGrid.toString() }
      )
      const step = `-> ${root}px: ${JSON.stringify(last)}`
      expect(frames, step).toBeGreaterThan(0)
      expect(frames, step).toBeLessThanOrEqual(10)
      expect(onRemGrid(await remGridState(page))).toBe(true)
    }
  })

  test(`${prefix} rem base that isn't whole layout units lands each Box within 1/32px`, async ({
    page,
  }) => {
    // 0.5rem at a 15.3px root is 7.65px (README: approximated within 1/32px;
    // the differences add up down a stack, so this checks each Box).
    await openRemGrid(page, `${url}&root=15.3`)
    const offsets = () =>
      page.evaluate(() => {
        const base =
          parseFloat(getComputedStyle(document.documentElement).fontSize) / 2
        return Array.from(
          document.querySelectorAll('[data-rem-grid="rem"] [data-rem="box"]'),
          (host) => {
            const height = host.getBoundingClientRect().height
            const remainder = ((height % base) + base) % base
            return Math.min(remainder, base - remainder)
          }
        )
      })
    await expect
      .poll(async () => Math.max(...(await offsets())))
      .toBeLessThanOrEqual(1 / 32)
  })

  test(`${prefix} rem base hydrates the 16px server HTML, then follows a 20px root`, async ({
    page,
  }) => {
    const response = await page.request.get(`${url}&root=20`)
    const html = await response.text()
    // The server knows no root size: the rem Spacer rounds to an 8px base.
    const spacer = html.match(/<div[^>]*data-rem="spacer"[^>]*>/)?.[0]
    expect(spacer).toContain('data-height="24px"')
    const messages: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning') {
        messages.push(message.text())
      }
    })
    await openRemGrid(page, `${url}&root=20`)
    await expect
      .poll(async () => onRemGrid(await remGridState(page)))
      .toBe(true)
    expect((await remGridState(page)).rem.spacer).toBe('20px')
    expect(
      messages.filter((text) => /hydrat|did not match|mismatch/i.test(text))
    ).toEqual([])
  })
}

/**
 * A9: what a root font size change (16 -> 20px) costs on the `?cost` page.
 * Counts, per Box, the frames in which its DOM changed (as liveGridStability
 * does) and the frames until every Box is on its grid (the 0.5rem base, or
 * 8px for the px control). The px-content Box only follows the base.
 */
async function rootChangeCost(page: Page, kind: 'rem' | 'px') {
  return page.evaluate(async (kind) => {
    const frame = () => new Promise((resolve) => requestAnimationFrame(resolve))
    const section = document.querySelector(`[data-cost-grid="${kind}"]`)!
    const hosts = Array.from(
      section.querySelectorAll<HTMLElement>('[data-cost]')
    )
    const pxContent = section.querySelector<HTMLElement>(
      '[data-cost="px-content"]'
    )!
    const owner = (node: Node) => {
      let element: Element | null =
        node instanceof Element ? node : node.parentElement
      while (element && !hosts.includes(element as HTMLElement)) {
        element = element.parentElement
      }
      return element as HTMLElement | null
    }
    let frameNumber = 0
    const updates = new Map(hosts.map((host) => [host, new Set<number>()]))
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (
          record.type === 'attributes' &&
          record.oldValue === (record.target as Element).getAttribute('style')
        ) {
          continue
        }
        const host = owner(record.target)
        if (host) updates.get(host)!.add(frameNumber)
      }
    })
    observer.observe(section, {
      attributes: true,
      attributeFilter: ['style'],
      attributeOldValue: true,
      childList: true,
      subtree: true,
    })
    const base = () =>
      kind === 'rem'
        ? parseFloat(getComputedStyle(document.documentElement).fontSize) / 2
        : 8
    const off = (host: Element) => {
      const step = base()
      const remainder =
        ((host.getBoundingClientRect().height % step) + step) % step
      return Math.min(remainder, step - remainder)
    }
    const onGrid = (host: Element) => off(host) <= 1 / 64
    const total = () =>
      [...updates.values()].reduce((sum, set) => sum + set.size, 0)
    // Settle the first snaps.
    for (let quiet = 0, count = 0; quiet < 5 && count < 120; count++) {
      const before = total()
      await frame()
      quiet = total() === before && hosts.every(onGrid) ? quiet + 1 : 0
    }
    updates.forEach((set) => set.clear())
    const heights = hosts.map((host) => host.getBoundingClientRect().height)
    document.documentElement.style.fontSize = '20px'
    let toGrid = -1
    let pxContentToGrid = -1
    let lastChange = 0
    for (let count = 1; count <= 60; count++) {
      frameNumber = count
      const before = total()
      await frame()
      if (total() !== before) lastChange = count
      const moved = hosts.some(
        (host, index) =>
          Math.abs(host.getBoundingClientRect().height - heights[index]) > 0.5
      )
      if (toGrid < 0 && moved && hosts.every(onGrid)) toGrid = count
      if (pxContentToGrid < 0 && onGrid(pxContent)) pxContentToGrid = count
    }
    observer.disconnect()
    const boxes = hosts.filter((host) => host !== pxContent)
    const counts = boxes.map((host) => updates.get(host)!.size)
    const histogram: Record<number, number> = {}
    for (const count of counts) histogram[count] = (histogram[count] ?? 0) + 1
    return {
      kind,
      boxes: boxes.length,
      toGrid,
      lastChange,
      updatesPerBox: {
        max: Math.max(...counts),
        mean: +(counts.reduce((a, b) => a + b, 0) / counts.length).toFixed(2),
        histogram,
      },
      pxContent: {
        toGrid: pxContentToGrid,
        updates: updates.get(pxContent)!.size,
        height: pxContent.getBoundingClientRect().height,
      },
      allOnGrid: hosts.every(onGrid),
    }
  }, kind)
}

function costTests(prefix: string, url: string) {
  test(`${prefix} records what a root font size change costs on 100 Boxes`, async ({
    page,
    browserName,
  }, testInfo) => {
    test.skip(browserName !== 'chromium', 'a recorded measurement, Chromium')
    const results = []
    for (const kind of ['rem', 'px'] as const) {
      await page.goto(`${url}${url.includes('?') ? '&' : '?'}cost=${kind}`)
      if (url.startsWith('/remix.html')) {
        await page.evaluate(
          () =>
            (window as unknown as { __baselineRemixReady: Promise<void> })
              .__baselineRemixReady
        )
      }
      await expect(page.locator('[data-cost-grid] [data-cost]')).toHaveCount(
        101
      )
      const result = await rootChangeCost(page, kind)
      results.push(result)
      expect(result.allOnGrid, JSON.stringify(result)).toBe(true)
      expect(result.toGrid, JSON.stringify(result)).toBeGreaterThan(0)
    }
    const [rem] = results
    // The px-content Box reaches the new 10px grid: 45 -> 50px.
    expect(rem.pxContent.toGrid, JSON.stringify(rem)).toBeGreaterThan(0)
    expect(rem.pxContent.toGrid, JSON.stringify(rem)).toBeLessThanOrEqual(10)
    expect(rem.pxContent.height).toBe(50)
    // The changeset's claim: no more frames than the px control (+1 slack).
    const [, px] = results
    expect(rem.toGrid, JSON.stringify(results)).toBeLessThanOrEqual(
      px.toGrid + 1
    )
    await testInfo.attach('root-change-cost.json', {
      body: JSON.stringify(results, null, 2),
      contentType: 'application/json',
    })
    console.log(`A9 ${prefix}: ${JSON.stringify(results)}`)
  })
}

async function openSpacers(page: Page, url: string) {
  await page.goto(url)
  if (url.startsWith('/remix.html')) {
    await page.evaluate(
      () =>
        (window as unknown as { __baselineRemixReady: Promise<void> })
          .__baselineRemixReady
    )
  }
  await expect(page.locator('[data-spacer]')).toHaveCount(17)
}

/** Rendered height (or width) of each `data-spacer` host, by id and grid. */
async function spacerSizes(page: Page, grid: 'px' | 'rem' = 'px') {
  return page.evaluate(
    (grid) =>
      Object.fromEntries(
        Array.from(
          document.querySelectorAll<HTMLElement>(
            `[data-spacer-grid="${grid}"] [data-spacer]`
          ),
          (spacer) => {
            const rect = spacer.getBoundingClientRect()
            return [
              spacer.dataset.spacer!,
              spacer.dataset.spacer!.startsWith('w') ? rect.width : rect.height,
            ]
          }
        )
      ),
    grid
  )
}

/** Each declaration of an inline style, whitespace-normalized. */
const declarations = (style: string) =>
  Object.fromEntries(
    style
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const colon = part.indexOf(':')
        return [
          part.slice(0, colon).trim(),
          part
            .slice(colon + 1)
            .replace(/\s+/g, ' ')
            .trim(),
        ]
      })
  )

function spacerStringTests(prefix: string, url: string) {
  const roundTo = (value: number, step: number) =>
    Math.round(value / step) * step

  test(`${prefix} spacer rem height rounds to the base at every root, live`, async ({
    page,
  }) => {
    // A7a: 1.3rem rounded to 8px (7.0: 24px at every root).
    for (const [root, expected] of [
      [16, 24],
      [17, 24],
      [20, 24],
      [24, 32],
    ]) {
      await openSpacers(page, `${url}&root=${root}`)
      await expect
        .poll(async () => (await spacerSizes(page)).rem13)
        .toBe(expected)
    }
    await openSpacers(page, `${url}&root=16`)
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '24px'
    })
    await expect.poll(async () => (await spacerSizes(page)).rem13).toBe(32)
  })

  test(`${prefix} spacer strings resolve as CSS does, rounded; others keep the base`, async ({
    page,
  }) => {
    // A7b.
    await openSpacers(page, url)
    const sizes = await spacerSizes(page)
    const { viewport, ch } = await page.evaluate(() => ({
      viewport: innerHeight,
      ch: document
        .querySelector('[data-spacer-probe="ch2"]')!
        .getBoundingClientRect().width,
    }))
    expect(sizes.pct50).toBe(48)
    expect(sizes.calc).toBe(80)
    expect(sizes.vh10).toBe(roundTo(viewport / 10, 8))
    expect(sizes.ch2).toBe(roundTo(ch, 8))
    for (const id of ['auto', 'unitless', 'keyword', 'oops', 'varfallback']) {
      expect(sizes[id], id).toBe(8)
    }
    // var() products and stepped functions stay live (7.1.0: 8, the base).
    expect(sizes.varn).toBe(32)
    expect(sizes.stepped).toBe(24)
  })

  test(`${prefix} spacer string height rounds to a rem base`, async ({
    page,
  }) => {
    // A7c: 1.3rem at a 20px root on a 10px base (7.0: 20px).
    await openSpacers(page, `${url}&root=20`)
    await expect
      .poll(async () => (await spacerSizes(page, 'rem')).rem13)
      .toBe(30)
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '16px'
    })
    await expect
      .poll(async () => (await spacerSizes(page, 'rem')).rem13)
      .toBe(24)
  })

  test(`${prefix} spacer string sizes hydrate the server HTML as is`, async ({
    page,
  }) => {
    // A7e, px base at a 20px root.
    const html = await (await page.request.get(`${url}&root=20`)).text()
    const serverStyle = (id: string) =>
      new RegExp(
        `<div[^>]*data-spacer="${id}"[^>]*style="([^"]*)"|<div[^>]*style="([^"]*)"[^>]*data-spacer="${id}"`
      )
        .exec(html)
        ?.slice(1)
        .find(Boolean)
    const messages: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning') {
        messages.push(message.text())
      }
    })
    await openSpacers(page, `${url}&root=20`)
    for (const id of ['rem13', 'vh10', 'pct50', 'w100']) {
      const server = serverStyle(id)
      expect(server, id).toBeTruthy()
      const client = await page
        .locator(`[data-spacer-grid="px"] [data-spacer="${id}"]`)
        .getAttribute('style')
      expect(declarations(client ?? ''), id).toEqual(
        declarations(server!.replace(/&quot;/g, '"'))
      )
    }
    expect(
      messages.filter((text) => /hydrat|did not match|mismatch/i.test(text))
    ).toEqual([])
  })

  test(`${prefix} spacer string heights fall back to 7.0's px without round()`, async ({
    page,
  }) => {
    // A7f: 10vh is 72px live at a 720px viewport, 112px in 7.0.
    await openSpacers(page, url)
    const live = (await spacerSizes(page)).vh10
    const removed = await page.evaluate(() => {
      for (const sheet of Array.from(document.styleSheets)) {
        let rules: CSSRuleList
        try {
          rules = sheet.cssRules
        } catch {
          continue
        }
        for (let index = rules.length - 1; index >= 0; index--) {
          const rule = rules[index]
          if (
            rule instanceof CSSSupportsRule &&
            rule.conditionText.includes('round(')
          ) {
            sheet.deleteRule(index)
            return true
          }
        }
      }
      return false
    })
    expect(removed).toBe(true)
    expect(live).not.toBe(112)
    expect((await spacerSizes(page)).vh10).toBe(112)
  })

  test(`${prefix} spacer widths render as written; numbers still round`, async ({
    page,
  }) => {
    // A7g: 7.0 rendered width="100%" as 0px.
    await openSpacers(page, url)
    const sizes = await spacerSizes(page)
    expect(sizes.w100).toBe(300)
    expect(sizes.w30).toBe(32)
  })

  test(`${prefix} spacer indicator shows the rendered size of a string height`, async ({
    page,
  }) => {
    // 2rem at a 20px root renders 40px (7.0's value: 32).
    await openSpacers(page, `${url}&root=20`)
    await expect(
      page.locator('[data-spacer="indicator"] .bk-indicator')
    ).toHaveText('40')
  })

  test(`${prefix} spacer indicator shows a measured 0px height, not the fallback`, async ({
    page,
  }) => {
    // calc(100% - 100px) in a 100px parent is 0px: only the 320px width
    // shows (7.0's fallback height would show 8).
    await openSpacers(page, url)
    await expect(
      page.locator('[data-spacer="indicator-zero"] .bk-indicator')
    ).toHaveText(['320'])
  })
}

/** Rendered gap, line period and column counts of the `?guides` Guides. */
async function guideState(page: Page) {
  return page.evaluate(() => {
    const cols = (id: string) =>
      document.querySelector<HTMLElement>(`[data-guide-case="${id}"] .bk-cols`)!
    const auto = cols('auto')
    const autoRem = cols('autorem')
    return {
      fixedGap: parseFloat(getComputedStyle(cols('fixed')).columnGap),
      linePeriod: parseFloat(
        getComputedStyle(
          document.querySelector('[data-guide-case="line"] .bk-gde')!
        ).getPropertyValue('--bkgd-line-period')
      ),
      autoGap: parseFloat(getComputedStyle(auto).columnGap),
      autoColumns: auto.querySelectorAll('.bk-col').length,
      autoTracks: getComputedStyle(auto)
        .gridTemplateColumns.split(' ')
        .filter(Boolean).length,
      autoRemColumns: autoRem.querySelectorAll('.bk-col').length,
      autoRemTracks: getComputedStyle(autoRem)
        .gridTemplateColumns.split(' ')
        .filter(Boolean).length,
    }
  })
}

function guideStringTests(prefix: string, url: string) {
  test(`${prefix} guide string gap follows the root font size`, async ({
    page,
  }) => {
    // A7d. 7.0: React drew no gap; Remix froze it at a 16px root.
    await page.goto(url)
    if (url.startsWith('/remix.html')) {
      await page.evaluate(
        () =>
          (window as unknown as { __baselineRemixReady: Promise<void> })
            .__baselineRemixReady
      )
    }
    // auto: floor((300 + gap) / (40 + gap)) columns; autorem (2.5rem
    // columns, 16px gap): floor(316 / (2.5 x root + 16)).
    const expected = (gap: number, columns: number, remColumns: number) => ({
      fixedGap: gap,
      linePeriod: gap,
      autoGap: gap,
      autoColumns: columns,
      autoTracks: columns,
      autoRemColumns: remColumns,
      autoRemTracks: remColumns,
    })
    await expect.poll(() => guideState(page)).toEqual(expected(16, 5, 5))
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '32px'
    })
    await expect.poll(() => guideState(page)).toEqual(expected(32, 4, 3))
    // 20px rounds to the 8px base: 24.
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '20px'
    })
    await expect.poll(() => guideState(page)).toEqual(expected(24, 5, 4))
  })
}

remGridTests('React', '/?remgrid')
costTests('React', '/')
spacerStringTests('React', '/?spacers')
guideStringTests('React', '/?guides')

liveGridTests('React', '/?live', '#live-grid')

test.describe('native Remix adapter', () => {
  liveGridTests('native', '/remix.html?live', '#remix-live-grid')
  remGridTests('native', '/remix.html?remgrid')
  costTests('native', '/remix.html')
  spacerStringTests('native', '/remix.html?spacers')
  guideStringTests('native', '/remix.html?guides')
})
