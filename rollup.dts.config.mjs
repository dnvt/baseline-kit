import { defineConfig } from 'rollup'
import dts from 'rollup-plugin-dts'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const kitAliases = {
  '@baseline-kit/core': resolve(__dirname, 'packages/core/src'),
  '@baseline-kit/dom': resolve(__dirname, 'packages/dom/src'),
  '@baseline-kit/react': resolve(__dirname, 'packages/react/src'),
}

export default defineConfig({
  input: 'packages/react/src/index.ts',
  output: { file: 'dist/index.d.ts', format: 'es' },
  external: ['react', 'react-dom', /^react\//, /^react-dom\//, /\.css$/],
  plugins: [
    {
      name: 'resolve-baseline-kit-workspaces',
      resolveId(source) {
        for (const [name, target] of Object.entries(kitAliases)) {
          if (source === name) return `${target}/index.ts`
          if (source.startsWith(`${name}/`)) {
            return `${target}/${source.slice(name.length + 1)}.ts`
          }
        }
        return null
      },
    },
    dts({ respectExternal: true }),
  ],
})
