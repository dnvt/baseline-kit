#!/usr/bin/env node

/**
 * Copy the shared stylesheets into dist. theme.css is generated from the
 * light and dark themes so the three files cannot drift apart.
 */

import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const source = resolve(import.meta.dirname, '../packages/core/src/styles')
const dist = resolve(import.meta.dirname, '../dist')
mkdirSync(resolve(dist, 'theme'), { recursive: true })

copyFileSync(resolve(source, 'baseline-kit.css'), resolve(dist, 'styles.css'))
copyFileSync(resolve(source, 'reset.css'), resolve(dist, 'reset.css'))
for (const theme of ['default', 'dark']) {
  copyFileSync(
    resolve(source, `theme/${theme}.css`),
    resolve(dist, `theme/${theme}.css`)
  )
}

const light = readFileSync(resolve(source, 'theme/default.css'), 'utf8')
const dark = readFileSync(resolve(source, 'theme/dark.css'), 'utf8')
writeFileSync(
  resolve(dist, 'theme.css'),
  `${light.trimEnd()}\n\n@media (prefers-color-scheme: dark) {\n${dark.trimEnd()}\n}\n`
)

// Type stub for the CSS exports, so `import 'baseline-kit/styles'` type-checks
// under TypeScript's noUncheckedSideEffectImports (on by default in TS 6+).
writeFileSync(resolve(dist, 'css.d.ts'), 'export {}\n')

console.log('✅ Copied styles, reset and themes to dist')
