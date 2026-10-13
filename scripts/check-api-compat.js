#!/usr/bin/env node

// Checks that the built declarations only add to the last published release:
// every export of each entry point still exists, every value is usable where
// the old one was, every type still accepts what the old one accepted, types
// the API returns (OUTPUT_TYPES) still fit where the old ones did, and
// ConfigSchema['base'] stays a number. Run `bun run build` first.
//
//   node scripts/check-api-compat.js [version]   (default: npm's latest)

import { execFileSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import ts from '@typescript/typescript6'

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
)
const packageJson = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')
)
// The latest published release, not package.json's version: after
// `changeset version` that is the unpublished release being checked.
const version =
  process.argv[2] ??
  execFileSync('npm', ['view', packageJson.name, 'dist-tags.latest'], {
    encoding: 'utf8',
  }).trim()
const ENTRIES = ['index', 'core', 'remix', 'remix-server']
// Types consumers read from the API: also checked in the other direction, so
// a field can't widen under code that reads it.
const OUTPUT_TYPES = new Set(['ConfigSchema', 'Padding', 'SnapState'])

// Inside node_modules so the old declarations resolve react and remix from
// this repository, like the new ones.
const workDir = path.join(repoRoot, 'node_modules/.cache/baseline-kit-api')
const oldDir = path.join(workDir, version)

function fetchRelease() {
  if (fs.existsSync(path.join(oldDir, 'index.d.ts'))) return
  fs.mkdirSync(oldDir, { recursive: true })
  const tarball = execFileSync(
    'npm',
    ['pack', `${packageJson.name}@${version}`, '--silent'],
    { cwd: workDir, encoding: 'utf8' }
  ).trim()
  execFileSync('tar', [
    '-xzf',
    path.join(workDir, tarball),
    '-C',
    oldDir,
    '--strip-components=2',
    ...ENTRIES.map((entry) => `package/dist/${entry}.d.ts`),
  ])
  fs.rmSync(path.join(workDir, tarball))
}

const OPTIONS = {
  strict: true,
  noEmit: true,
  skipLibCheck: true,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  target: ts.ScriptTarget.ES2022,
  jsx: ts.JsxEmit.ReactJSX,
}

/** The exports of a declaration file: name, value or type, type parameters. */
function listExports(file) {
  const program = ts.createProgram([file], OPTIONS)
  const checker = program.getTypeChecker()
  const moduleSymbol = checker.getSymbolAtLocation(program.getSourceFile(file))
  if (!moduleSymbol) return []
  return checker.getExportsOfModule(moduleSymbol).map((symbol) => {
    const target =
      symbol.flags & ts.SymbolFlags.Alias
        ? checker.getAliasedSymbol(symbol)
        : symbol
    const typeParameters =
      target.declarations?.find((declaration) => declaration.typeParameters)
        ?.typeParameters?.length ?? 0
    return {
      name: symbol.name,
      isValue: Boolean(target.flags & ts.SymbolFlags.Value),
      isType: Boolean(target.flags & ts.SymbolFlags.Type),
      typeParameters,
    }
  })
}

function buildChecks() {
  const lines = [
    'type Assert<T extends true> = T',
    'type Extends<A, B> = [A] extends [B] ? true : false',
    'type Equals<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false',
  ]
  const labels = new Map()
  const add = (line, label) => {
    lines.push(line)
    labels.set(lines.length, label)
  }
  for (const entry of ENTRIES) {
    const id = entry.replace(/\W/g, '_')
    const oldPath = path.join(oldDir, `${entry}.d.ts`)
    const newPath = path.join(repoRoot, 'dist', `${entry}.d.ts`)
    if (!fs.existsSync(newPath)) {
      throw new Error(`Missing dist/${entry}.d.ts: run \`bun run build\``)
    }
    const spec = (file) => {
      const relative = path.relative(workDir, file).replace(/\.d\.ts$/, '')
      return JSON.stringify(
        relative.startsWith('.') ? relative : `./${relative}`
      )
    }
    lines.push(`import type * as Old_${id} from ${spec(oldPath)}`)
    lines.push(`import type * as New_${id} from ${spec(newPath)}`)
    for (const item of listExports(oldPath)) {
      const label = `${entry}: ${item.name}`
      const args = item.typeParameters
        ? `<${Array(item.typeParameters).fill('any').join(', ')}>`
        : ''
      if (item.isValue) {
        add(
          `type V_${id}_${item.name} = Assert<Extends<typeof New_${id}.${item.name}, typeof Old_${id}.${item.name}>>`,
          `${label} (value no longer usable where it was)`
        )
      }
      if (item.isType) {
        add(
          `type T_${id}_${item.name} = Assert<Extends<Old_${id}.${item.name}${args}, New_${id}.${item.name}${args}>>`,
          `${label} (type narrowed or removed)`
        )
      }
      if (item.isType && OUTPUT_TYPES.has(item.name)) {
        add(
          `type O_${id}_${item.name} = Assert<Extends<New_${id}.${item.name}${args}, Old_${id}.${item.name}${args}>>`,
          `${label} (output type widened)`
        )
      }
      if (item.name === 'ConfigSchema') {
        add(
          `type B_${id} = Assert<Equals<New_${id}.ConfigSchema['base'], number>>`,
          `${label} (base is no longer number)`
        )
      }
    }
  }
  return { source: lines.join('\n') + '\n', labels }
}

fetchRelease()
const { source, labels } = buildChecks()
const checkFile = path.join(workDir, 'check.ts')
fs.writeFileSync(checkFile, source)
const program = ts.createProgram([checkFile], OPTIONS)
const diagnostics = ts.getPreEmitDiagnostics(program)
const failures = new Set()
for (const diagnostic of diagnostics) {
  if (diagnostic.file?.fileName !== checkFile) {
    failures.add(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
    continue
  }
  const { line } = diagnostic.file.getLineAndCharacterOfPosition(
    diagnostic.start ?? 0
  )
  failures.add(
    labels.get(line + 1) ??
      ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
  )
}
const checks = labels.size
if (failures.size > 0) {
  console.error(
    `❌ API compatibility with ${version}: ${failures.size} failure(s)`
  )
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}
console.log(`✅ API compatible with ${version} (${checks} checks)`)
