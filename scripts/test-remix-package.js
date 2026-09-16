#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const fixtureSource = resolve(repoRoot, 'tests/integration/remix-v3')
const tempRoot = mkdtempSync(join(tmpdir(), 'baseline-kit-remix-v3-'))
const fixtureDir = join(tempRoot, 'fixture')

const run = (command, args, options = {}) =>
  execFileSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: 'inherit',
    ...options,
  })

try {
  const packageJson = JSON.parse(
    readFileSync(resolve(repoRoot, 'package.json'), 'utf8')
  )
  if (!existsSync(resolve(repoRoot, 'dist/remix.mjs'))) {
    throw new Error('Build the package before running the packed Remix fixture')
  }

  const packOutput = mkdtempSync(join(tempRoot, 'pack-output-'))
  run('npm', ['pack', '--ignore-scripts', '--pack-destination', packOutput])
  const tarball = readdirSync(packOutput).find((file) => file.endsWith('.tgz'))
  if (!tarball) throw new Error('npm pack did not produce a tarball')

  mkdirSync(fixtureDir, { recursive: true })
  writeFileSync(
    resolve(fixtureDir, 'package.json'),
    JSON.stringify({ name: 'baseline-kit-remix-v3-fixture', type: 'module' })
  )
  cpSync(fixtureSource, fixtureDir, { recursive: true })

  run(
    'npm',
    [
      'install',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      '--prefix',
      fixtureDir,
      resolve(packOutput, tarball),
      `remix@${packageJson.devDependencies.remix}`,
    ],
    { cwd: fixtureDir }
  )

  if (
    existsSync(resolve(fixtureDir, 'node_modules/react')) ||
    existsSync(resolve(fixtureDir, 'node_modules/react-dom'))
  ) {
    throw new Error('Native Remix fixture unexpectedly installed React peers')
  }

  const reactFixtureDir = join(tempRoot, 'react-fixture')
  mkdirSync(reactFixtureDir, { recursive: true })
  writeFileSync(
    resolve(reactFixtureDir, 'package.json'),
    JSON.stringify({ name: 'baseline-kit-react-fixture', type: 'module' })
  )
  run(
    'npm',
    [
      'install',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      '--prefix',
      reactFixtureDir,
      resolve(packOutput, tarball),
      'react@19.2.4',
      'react-dom@19.2.4',
    ],
    { cwd: reactFixtureDir }
  )
  if (existsSync(resolve(reactFixtureDir, 'node_modules/remix'))) {
    throw new Error('React fixture unexpectedly installed the Remix peer')
  }
  const reactEntry = await import(
    pathToFileURL(
      resolve(reactFixtureDir, 'node_modules/baseline-kit/dist/index.mjs')
    ).href
  )
  const guideEntry = await import(
    pathToFileURL(
      resolve(reactFixtureDir, 'node_modules/baseline-kit/dist/guide.mjs')
    ).href
  )
  if (typeof reactEntry.Baseline !== 'object') {
    throw new Error('Packed React entry did not load in the React fixture')
  }

  const react = await import(
    pathToFileURL(resolve(reactFixtureDir, 'node_modules/react/index.js')).href
  )
  const reactServer = await import(
    pathToFileURL(
      resolve(reactFixtureDir, 'node_modules/react-dom/server.node.js')
    ).href
  )
  const mixedEntryHtml = reactServer.renderToString(
    react.createElement(
      reactEntry.Config,
      {
        guide: {
          debugging: 'visible',
          variant: 'fixed',
        },
      },
      react.createElement(guideEntry.Guide, {
        debugging: 'visible',
        columns: 4,
      })
    )
  )
  if (!mixedEntryHtml.includes('data-variant="fixed"')) {
    throw new Error('Packed root and guide entries do not share Config context')
  }

  const bundledNativeEntry = readFileSync(
    resolve(fixtureDir, 'node_modules/baseline-kit/dist/remix.mjs'),
    'utf8'
  )
  if (/from\s+["'](?:react|react-dom)(?:\/|["'])/.test(bundledNativeEntry)) {
    throw new Error('Packed native Remix entry contains a React import')
  }

  const typecheckConfig = resolve(tempRoot, 'tsconfig.json')
  writeFileSync(
    typecheckConfig,
    JSON.stringify({
      compilerOptions: {
        strict: true,
        target: 'ES2022',
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        skipLibCheck: true,
        noEmit: true,
      },
      files: [resolve(fixtureDir, 'fixture-types.ts')],
    })
  )
  run(
    resolve(repoRoot, 'node_modules/.bin/tsc'),
    ['--project', typecheckConfig],
    {
      cwd: fixtureDir,
    }
  )

  run(
    resolve(repoRoot, 'node_modules/.bin/playwright'),
    [
      'test',
      '--project=chromium',
      '--project=firefox',
      '--project=webkit',
      '--grep',
      'native Remix adapter',
    ],
    {
      cwd: repoRoot,
      env: {
        ...process.env,
        BASELINE_KIT_PACKAGE_ROOT: resolve(
          fixtureDir,
          'node_modules/baseline-kit'
        ),
      },
    }
  )

  const fixture = await import(
    pathToFileURL(resolve(fixtureDir, 'fixture.mjs')).href
  )
  const html = await fixture.renderFixture()
  for (const marker of [
    'Packed Remix fixture content.',
    'data-testid="baseline"',
    '--bkbl-cl: #ff0000',
    'data-testid="box"',
    '--bkbx-cl: #112233',
    'data-testid="spacer"',
    '--bksp-cf: #556677',
    'data-testid="padder"',
    'data-testid="guide"',
  ]) {
    if (!html.includes(marker)) {
      throw new Error(`Packed Remix SSR output is missing: ${marker}`)
    }
  }

  console.log('✅ Packed Remix v3 fixture passed')
} finally {
  rmSync(tempRoot, { recursive: true, force: true })
}
