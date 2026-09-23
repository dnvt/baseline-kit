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

const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8')
)
const checkExport = (value) => {
  if (typeof value === 'string') {
    assert(
      fs.existsSync(path.resolve(__dirname, '..', value)),
      `Export target does not exist: ${value}`
    )
  } else {
    Object.values(value).forEach(checkExport)
  }
}
Object.values(packageJson.exports).forEach(checkExport)
assert(
  packageJson.workspaces.includes('.'),
  'Changesets must discover the public root package'
)
for (const name of ['core', 'dom', 'react', 'remix']) {
  const workspace = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, `../packages/${name}/package.json`),
      'utf8'
    )
  )
  assert(
    workspace.private === true,
    `Implementation workspace ${name} must remain private`
  )
}

const stylesCSS = readDist('styles.css')
const guideCSS = readDist('guide.css')
const fullCSS = readDist('baseline-kit.css')
const indexMjs = readDist('index.mjs')
const indexDts = readDist('index.d.ts')
const guideDts = readDist('guide.d.ts')
const coreDts = readDist('core.d.ts')
const remixMjs = readDist('remix.mjs')
const remixCSS = readDist('remix.css')
const remixDts = readDist('remix.d.ts')
const remixServerDts = readDist('remix-server.d.ts')
assert(
  !/:\s*any\b/.test(remixServerDts) &&
    ['renderToStream', 'renderToString', 'ImportMap'].every((name) =>
      remixServerDts.includes(`typeof RemixServer.${name}`)
    ),
  'The Node SSR compatibility entry must preserve upstream callable types'
)

assert(
  !stylesCSS.includes('/* Guide Styles */'),
  'styles.css must not append guide.css; root build already includes Guide CSS'
)
assert(
  count(stylesCSS, 'repeating-linear-gradient') === 2,
  'styles.css must contain one Guide and one Baseline gradient'
)
assert(
  count(fullCSS, 'repeating-linear-gradient') === 2,
  'baseline-kit.css must contain one Guide and one Baseline gradient'
)
assert(
  count(guideCSS, 'repeating-linear-gradient') === 1,
  'guide.css must contain only the Guide line gradient'
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

assert(
  !/from\s+["'](?:remix|remix\/)|require\(["'](?:remix|remix\/)/.test(indexMjs),
  'index.mjs must remain isolated from the native Remix runtime'
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

assert(
  remixMjs.includes('clientEntry') && remixMjs.includes('remix/ui'),
  'remix.mjs must retain the Remix UI runtime boundary'
)
assert(
  !/from\s+["'](?:react|react-dom)(?:\/|["'])/.test(remixMjs) &&
    !/require\(["'](?:react|react-dom)(?:\/|["'])/.test(remixMjs),
  'remix.mjs must not import React or react-dom'
)
assert(
  remixCSS.includes('.bk-bas') && remixCSS.includes('.bk-gde'),
  'remix.css must include native Baseline and Guide selectors'
)
assert(
  remixDts.includes(
    'export { Baseline, Box, Config, Guide, Padder, Spacer }'
  ) &&
    !remixDts.includes('__baselineConfig') &&
    !/(from\s+["']@baseline-kit\/|import\(["']@baseline-kit\/)/.test(remixDts),
  'remix.d.ts must expose only public native components without unresolved workspace imports'
)

console.log('✅ Artifact verification passed')
