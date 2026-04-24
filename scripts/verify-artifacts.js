#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distDir = path.resolve(__dirname, '../dist')

const readDist = (file) => {
  const filePath = path.join(distDir, file)
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing dist artifact: ${file}`)
  }
  return fs.readFileSync(filePath, 'utf8')
}

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const count = (source, needle) => source.split(needle).length - 1

const stylesCSS = readDist('styles.css')
const guideCSS = readDist('guide.css')
const fullCSS = readDist('baseline-kit.css')
const indexDts = readDist('index.d.ts')
const guideDts = readDist('guide.d.ts')
const coreDts = readDist('core.d.ts')

assert(
  !stylesCSS.includes('/* Guide Styles */'),
  'styles.css must not append guide.css; root build already includes Guide CSS'
)
assert(
  count(stylesCSS, 'repeating-linear-gradient') === 1,
  'styles.css must contain Guide line gradient exactly once'
)
assert(
  count(fullCSS, 'repeating-linear-gradient') === 1,
  'baseline-kit.css must contain Guide line gradient exactly once'
)

const globalLeakPattern =
  /(^|[,{]\s*)\.(box|line|flat|col|ssr|v|h|gde|bas|spr|pad)\b|(^|[,\s])(\*|body|html)\s*\{/m

for (const [file, css] of [
  ['styles.css', stylesCSS],
  ['guide.css', guideCSS],
  ['baseline-kit.css', fullCSS],
]) {
  assert(!globalLeakPattern.test(css), `${file} contains unscoped global CSS`)
}

assert(
  !/\.(bas|box|pad|spr|row)_/.test(guideCSS),
  'guide.css must not include non-Guide component module selectors'
)

for (const [file, dts] of [
  ['index.d.ts', indexDts],
  ['guide.d.ts', guideDts],
  ['core.d.ts', coreDts],
]) {
  assert(
    !/(from\s+['"]@baseline-kit\/|import\(['"]@baseline-kit\/)/.test(dts),
    `${file} must not leak unresolved workspace imports`
  )
}

console.log('✅ Artifact verification passed')
