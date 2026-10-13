import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'

// Lightning CSS is the minifier Vite uses; resolve it through Vite.
const requireFromVite = createRequire(
  createRequire(import.meta.url).resolve('vite')
)
const { transform } = requireFromVite(
  'lightningcss'
) as typeof import('lightningcss')

const stylesheet = readFileSync(
  resolve(
    import.meta.dirname,
    '../../packages/core/src/styles/baseline-kit.css'
  )
)

describe('Spacer string heights in the stylesheet', () => {
  it('keeps the round() guard and the reset through minification', () => {
    const minified = String(
      transform({
        filename: 'baseline-kit.css',
        code: stylesheet,
        minify: true,
      }).code
    )
    expect(minified).toContain(
      '@supports (height:round(nearest, 1rem, 1px)){.bk-spr{height:var(--bksp-hl,var(--bksp-h))}}'
    )
    expect(minified).toMatch(/\.bk-spr\{[^}]*--bksp-hl:initial/)
  })
})
