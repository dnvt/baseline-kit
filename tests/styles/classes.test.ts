import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import {
  createBaselineDescriptor,
  createBoxDescriptor,
  createGuideDescriptor,
  createPadderDescriptor,
  createSpacerDescriptor,
} from '@baseline-kit/core'

const root = resolve(import.meta.dirname, '../..')
const css = readFileSync(
  join(root, 'packages/core/src/styles/baseline-kit.css'),
  'utf8'
)

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? sourceFiles(join(dir, entry.name))
      : /\.tsx?$/.test(entry.name)
        ? [join(dir, entry.name)]
        : []
  )

/** Every `bk-*` class either entry can render. */
const emittedClasses = () => {
  const literals = ['react', 'remix'].flatMap((entry) =>
    sourceFiles(join(root, 'packages', entry, 'src')).flatMap((file) =>
      [...readFileSync(file, 'utf8').matchAll(/['"`](bk-[a-z_-]+)['"`]/g)].map(
        (match) => match[1]
      )
    )
  )
  const padding = { top: 0, right: 0, bottom: 0, left: 0 }
  const tokens = [
    ...(['line', 'flat'] as const).flatMap((variant) =>
      [true, false].flatMap(
        (isVisible) =>
          createBaselineDescriptor({
            base: 8,
            colors: { line: 'red', flat: 'blue' },
            variant,
            containerWidth: 400,
            containerHeight: 160,
            spacing: {},
            isVisible,
            domDiagnostics: false,
          }).classTokens
      )
    ),
    ...createBoxDescriptor({
      base: 8,
      lineColor: 'red',
      isVisible: true,
      padding,
      paddingColor: 'blue',
    }).classTokens,
    ...(['line', 'pattern', 'fixed', 'auto'] as const).flatMap(
      (variant) =>
        createGuideDescriptor({
          base: 8,
          colors: { line: 'a', pattern: 'b', fixed: 'c', auto: 'd' },
          variant,
          align: 'center',
          template: 'none',
          columnsCount: 12,
          calculatedGap: 0,
          isVisible: true,
        }).classTokens
    ),
    ...createPadderDescriptor({
      base: 8,
      color: 'red',
      padding,
      enableSpacers: true,
      isVisible: true,
    }).classTokens,
    ...(['line', 'flat'] as const).flatMap(
      (variant) =>
        createSpacerDescriptor({
          base: 8,
          colors: { line: 'a', flat: 'b', text: 'c' },
          variant,
          isVisible: true,
        }).classTokens
    ),
  ].map((token) => `bk-${token}`)
  return [...new Set([...literals, ...tokens])]
}

describe('shared stylesheet', () => {
  it('styles every bk-* class the React and Remix entries render', () => {
    const missing = emittedClasses().filter(
      (name) => !new RegExp(`\\.${name}(?![a-z_-])`).test(css)
    )
    expect(missing).toEqual([])
  })

  it('keeps every rule at single-class specificity', () => {
    const selectors = css
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split('}')
      .map((block) => block.split('{')[0].trim())
      .filter((selector) => selector && !selector.startsWith(':root'))
      .flatMap((selector) => selector.split(/,(?![^(]*\))/))
      .map((selector) => selector.replace(/:where\([^)]*\)/g, ''))
    const heavy = selectors.filter(
      (selector) => (selector.match(/\.[a-z_-]+/g) ?? []).length > 1
    )
    expect(heavy).toEqual([])
  })
})
