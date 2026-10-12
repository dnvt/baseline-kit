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
const themeCSS = readDist('theme.css')
const indexMjs = readDist('index.mjs')
const indexDts = readDist('index.d.ts')
const coreDts = readDist('core.d.ts')
const remixMjs = readDist('remix.mjs')
const remixDts = readDist('remix.d.ts')
const remixServerDts = readDist('remix-server.d.ts')
assert(
  !/:\s*any\b/.test(remixServerDts) &&
    ['renderToStream', 'renderToString', 'ImportMap'].every((name) =>
      remixServerDts.includes(`typeof RemixServer.${name}`)
    ),
  'The Node SSR compatibility entry must preserve upstream callable types'
)

for (const selector of [
  '.bk-bas',
  '.bk-box',
  '.bk-pad',
  '.bk-spr',
  '.bk-gde',
]) {
  assert(stylesCSS.includes(selector), `styles.css must include ${selector}`)
}
assert(
  count(stylesCSS, 'repeating-linear-gradient') === 2,
  'styles.css must contain one Guide and one Baseline gradient'
)
assert(
  !/(^|[,{]\s*)\.(box|line|flat|col|ssr|v|h|gde|bas|spr|pad)\b|(^|[,\s])(\*|body|html)\s*\{/m.test(
    stylesCSS
  ),
  'styles.css must only use bk-prefixed selectors'
)
assert(
  themeCSS.includes('@media (prefers-color-scheme: dark)'),
  'theme.css must include the dark theme for prefers-color-scheme'
)
for (const [subpath, target] of Object.entries(packageJson.exports)) {
  if (typeof target === 'object' && String(target.default).endsWith('.css')) {
    assert(
      target.types === './dist/css.d.ts',
      `${subpath} must declare the CSS type stub`
    )
  }
}

for (const file of [
  'guide.mjs',
  'guide.css',
  'remix.css',
  'baseline-kit.css',
]) {
  assert(
    !fs.existsSync(path.join(distDir, file)),
    `${file} is no longer part of the package`
  )
}

assert(
  !/from\s+["'](?:remix|remix\/)|require\(["'](?:remix|remix\/)/.test(indexMjs),
  'index.mjs must remain isolated from the native Remix runtime'
)

for (const [file, dts] of [
  ['index.d.ts', indexDts],
  ['core.d.ts', coreDts],
]) {
  assert(
    !/(from\s+['"]@baseline-kit\/|import\(['"]@baseline-kit\/)/.test(dts),
    `${file} must not leak unresolved workspace imports`
  )
}

assert(
  remixMjs.includes('clientEntry') && remixMjs.includes('remix/component'),
  'remix.mjs must retain the Remix UI runtime boundary'
)
assert(
  !/from\s+["'](?:react|react-dom)(?:\/|["'])/.test(remixMjs) &&
    !/require\(["'](?:react|react-dom)(?:\/|["'])/.test(remixMjs),
  'remix.mjs must not import React or react-dom'
)
assert(
  remixDts.includes(
    'export { Baseline, Box, Config, Guide, Padder, Spacer }'
  ) &&
    !remixDts.includes('__baselineConfig') &&
    !/(from\s+["']@baseline-kit\/|import\(["']@baseline-kit\/)/.test(remixDts),
  'remix.d.ts must expose only public native components without unresolved workspace imports'
)

const exportedNames = (dts) =>
  [...dts.matchAll(/export (?:type )?\{([^}]*)\}/g)]
    .flatMap((match) => match[1].split(','))
    .map((name) =>
      name
        .trim()
        .split(/\s+as\s+/)
        .pop()
    )
    .filter(Boolean)
    .sort()
const reactNames = exportedNames(indexDts).join(',')
const remixNames = exportedNames(remixDts).join(',')
assert(
  reactNames === remixNames,
  `React and Remix entries must export the same names:\n  react: ${reactNames}\n  remix: ${remixNames}`
)

console.log('✅ Artifact verification passed')
