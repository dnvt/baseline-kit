import { expect, test, type Page } from '@playwright/test'
import {
  GEO_CASES,
  GEO_TWINS,
  LEGACY_CSS,
  ROW_CASES,
  ROW_WORDS_MANY,
  rowWordsHtml,
  type RowVariant,
} from './baseline-rows'

/**
 * Issue #36: Box and Padder text in rows aligned on the first or last
 * baseline. The matrix reports every variant's offset from the row baseline;
 * a variant is asserted once a change makes it land in every engine.
 */
const ASSERTED_VARIANTS: RowVariant[] = [
  'merged',
  'merged-visible',
  'semantic-h3',
  'semantic-p',
  'nested',
  'empty',
  'separate',
  'separate-visible',
  'separate-plain',
  'padder',
  'padder-plain',
]

test.beforeEach(({ page }) => {
  page.on('pageerror', (error) => {
    throw error
  })
})

async function openRows(page: Page, url: string) {
  await page.goto(url)
  if (url.startsWith('/remix.html')) {
    await page.evaluate(
      () =>
        (window as unknown as { __baselineRemixReady: Promise<void> })
          .__baselineRemixReady
    )
  }
  await expect(page.locator('[data-row]')).toHaveCount(ROW_CASES.length)
  await expect(page.locator('[data-geo]')).toHaveCount(GEO_CASES.length)
  // Snapping Boxes settle: no row changes height for 10 frames.
  await page.evaluate(async () => {
    const frame = () => new Promise((resolve) => requestAnimationFrame(resolve))
    const heights = () =>
      Array.from(
        document.querySelectorAll('[data-row], [data-geo]'),
        (row) => row.getBoundingClientRect().height
      ).join()
    let last = heights()
    for (let quiet = 0, count = 0; quiet < 10 && count < 300; count++) {
      await frame()
      const next = heights()
      quiet = next === last ? quiet + 1 : 0
      last = next
    }
  })
}

/** Each row's offset of its Box or Padder text from the reference baseline. */
function measureRows() {
  return Array.from(
    document.querySelectorAll<HTMLElement>('[data-row]'),
    (row) => {
      const reference = row
        .querySelector('.rows-ref .m')!
        .getBoundingClientRect().top
      const subject = row.lastElementChild!
      const marks = Array.from(
        subject.querySelectorAll('.m'),
        (mark) => mark.getBoundingClientRect().top
      )
      // An empty Box aligns the bottom of its content host.
      const target = marks.length
        ? row.style.alignItems === 'last baseline'
          ? Math.max(...marks)
          : Math.min(...marks)
        : subject.querySelector('.bk-pad-content')!.getBoundingClientRect()
            .bottom
      return {
        id: row.dataset.row!,
        variant: row.dataset.row!.split('|')[0],
        delta: target - reference,
      }
    }
  )
}

/** Fills each twin slot, then measures every fixture and its twin. */
function measureGeometry({
  twins,
  css,
  text,
}: {
  twins: Record<string, string>
  css: string
  text: string
}) {
  const style = document.createElement('style')
  style.textContent = css
  document.head.append(style)
  for (const slot of document.querySelectorAll<HTMLElement>(
    '[data-geo-twin]'
  )) {
    slot.innerHTML = twins[slot.dataset.geoTwin!].replace('__TEXT__', text)
    slot.firstElementChild!.setAttribute('data-subject', '')
  }
  const measure = (host: Element) => {
    const origin = host.getBoundingClientRect()
    const rect = (element: Element) => {
      const box = element.getBoundingClientRect()
      return [
        box.left - origin.left,
        box.top - origin.top,
        box.width,
        box.height,
      ]
    }
    const computed = getComputedStyle(host)
    return {
      host: [origin.width, origin.height],
      scroll: [host.scrollWidth, host.scrollHeight],
      content: Array.from(
        host.querySelectorAll('.bk-pad-content, .lg-pad-content'),
        rect
      ),
      percent: Array.from(host.querySelectorAll('[data-geo-pct]'), rect),
      spacers: Array.from(host.querySelectorAll('.bk-spr'), rect),
      bands: [
        computed.getPropertyValue('--bkpd-is'),
        computed.getPropertyValue('--bkpd-ie'),
      ],
    }
  }
  return Array.from(
    document.querySelectorAll<HTMLElement>('[data-geo]'),
    (fixture) => {
      const id = fixture.dataset.geo!
      const twin = document.querySelector(`[data-geo-twin="${id}"]`)!
      return {
        id,
        fixture: measure(fixture.firstElementChild!),
        twin: measure(twin.firstElementChild!),
      }
    }
  )
}

function alignmentTests(prefix: string, url: string) {
  test(`${prefix} baseline rows report each variant's offset from the row baseline`, async ({
    page,
  }, testInfo) => {
    await openRows(page, url)
    const cells = await page.evaluate(measureRows)
    expect(cells).toHaveLength(ROW_CASES.length)
    await testInfo.attach('baseline-rows.json', {
      body: JSON.stringify(cells, null, 1),
      contentType: 'application/json',
    })
    const off = cells.filter(
      (cell) =>
        ASSERTED_VARIANTS.includes(cell.variant as RowVariant) &&
        Math.abs(cell.delta) > 0.01
    )
    expect(off, 'asserted variants off the row baseline').toEqual([])
  })

  test(`${prefix} content reaching into spacer padding takes the pointer`, async ({
    page,
  }) => {
    await openRows(page, url)
    const hit = await page.evaluate(() => {
      const button = document.querySelector<HTMLElement>('[data-hit]')!
      button.scrollIntoView({ block: 'center' })
      const padder = button.closest('.bk-pad')!
      const content = button.closest('.bk-pad-content')!.getBoundingClientRect()
      const box = button.getBoundingClientRect()
      const x = box.left + box.width / 2
      const takes = (y: number) => {
        const element = document.elementFromPoint(x, y)
        return element !== null && button.contains(element)
      }
      return {
        bands: padder.querySelectorAll(
          ':scope > :is(.bk-pad-top, .bk-pad-bottom)'
        ).length,
        above: content.top - box.top,
        below: box.bottom - content.bottom,
        top: takes((box.top + content.top) / 2),
        bottom: takes((box.bottom + content.bottom) / 2),
      }
    })
    // The trimmed first line leaves the button reaching into both bands.
    expect(hit.bands, 'top and bottom spacers').toBe(2)
    expect(hit.above).toBeGreaterThan(1)
    expect(hit.below).toBeGreaterThan(1)
    expect(hit, 'the button takes the pointer over the padding').toMatchObject({
      top: true,
      bottom: true,
    })
  })

  test(`${prefix} spacer indicators keep the Padder's size`, async ({
    page,
  }) => {
    await openRows(page, url)
    await expect(
      page.locator('[data-ind="visible"] .bk-indicator').first()
    ).toBeVisible()
    const size = (debugging: string) =>
      page.locator(`[data-ind="${debugging}"]`).evaluate((host) => {
        const box = host.getBoundingClientRect()
        return [box.width, box.height]
      })
    expect(await size('visible')).toEqual(await size('hidden'))
  })

  test(`${prefix} a taller plain Padder keeps its rows at their content height`, async ({
    page,
  }) => {
    await openRows(page, url)
    const layout = await page.locator('[data-plain-rows]').evaluate((host) => {
      const origin = host.getBoundingClientRect()
      return {
        height: origin.height,
        items: Array.from(
          host.querySelectorAll('[data-plain-item]'),
          (item) => {
            const box = item.getBoundingClientRect()
            return { top: box.top - origin.top, height: box.height }
          }
        ),
      }
    })
    // A height of 120px, plus the 8px block padding outside it.
    expect(layout.height).toBe(136)
    // Three children fill the first row and the fourth starts the second:
    // both rows keep their content height, as the first did before 7.2.1.
    const [first, , , fourth] = layout.items
    expect(layout.items).toHaveLength(4)
    // Start-aligned: the first row sits on the 8px padding at its 24px line,
    // and the second follows it, rather than either row taking the rest.
    expect(first.top).toBeCloseTo(8, 2)
    expect(first.height).toBeCloseTo(24, 2)
    expect(fourth.height).toBeCloseTo(first.height, 2)
    expect(fourth.top).toBeCloseTo(first.top + first.height, 2)
  })

  test(`${prefix} Box and Padder geometry matches the 7.1.2 markup`, async ({
    page,
  }) => {
    await openRows(page, url)
    const cases = await page.evaluate(measureGeometry, {
      twins: GEO_TWINS,
      css: LEGACY_CSS,
      text: rowWordsHtml(ROW_WORDS_MANY),
    })
    expect(cases).toHaveLength(GEO_CASES.length)
    for (const { id, fixture, twin } of cases) {
      expect(fixture.content.length, `${id} content hosts`).toBe(
        twin.content.length
      )
      expect(fixture.spacers.length, `${id} spacers`).toBe(twin.spacers.length)
      const close = (a: number[], b: number[]) =>
        a.every((value, index) => Math.abs(value - b[index]) <= 0.01)
      expect(
        close(fixture.host, twin.host),
        `${id} host ${fixture.host} vs ${twin.host}`
      ).toBe(true)
      expect(fixture.scroll, `${id} scroll size`).toEqual(twin.scroll)
      for (const key of ['content', 'percent', 'spacers'] as const) {
        fixture[key].forEach((rect, index) => {
          expect(
            close(rect, twin[key][index]),
            `${id} ${key}[${index}] ${rect} vs ${twin[key][index]}`
          ).toBe(true)
        })
      }
      expect(fixture.bands, `${id} padding bands`).toEqual(twin.bands)
    }
  })
}

alignmentTests('React', '/?rows')

test.describe('native Remix adapter', () => {
  alignmentTests('native', '/remix.html?rows')
})
