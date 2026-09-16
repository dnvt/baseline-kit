#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const bun = process.platform === 'win32' ? 'bun.exe' : 'bun'

for (let attempt = 1; attempt <= 3; attempt += 1) {
  console.log(`\nBrowser regression pass ${attempt}/3`)
  const result = spawnSync(bun, ['run', 'test:browser', '--', '--retries=0'], {
    cwd: repoRoot,
    env: process.env,
    stdio: 'inherit',
  })

  if (result.error) {
    console.error(result.error)
    process.exit(1)
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}
