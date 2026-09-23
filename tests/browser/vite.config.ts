import { defineConfig } from 'vite'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react-swc'
import { alias } from '../../alias.config.ts'

const packageRoot = process.env.BASELINE_KIT_PACKAGE_ROOT

export default defineConfig({
  root: 'tests/browser',
  plugins: [
    react(),
    {
      name: 'baseline-browser-ssr',
      configureServer(server) {
        server.middlewares.use(async (request, response, next) => {
          const pathname = request.url?.split('?')[0]
          if (pathname === '/__baseline-react.css') {
            const css = packageRoot
              ? await readFile(resolve(packageRoot, 'dist/styles.css'), 'utf8')
              : (
                  await Promise.all(
                    [
                      '../../packages/react/src/components/Baseline/styles.module.css',
                      '../../packages/react/src/components/Box/styles.module.css',
                      '../../packages/react/src/components/Guide/styles.module.css',
                      '../../packages/react/src/components/Padder/styles.module.css',
                      '../../packages/react/src/components/Spacer/styles.module.css',
                    ].map(async (path) => {
                      const file = resolve(server.config.root, path)
                      const moduleUrl = `/@fs/${file.startsWith('/') ? file.slice(1) : file}?direct`
                      const transformed =
                        await server.transformRequest(moduleUrl)
                      return transformed?.code ?? ''
                    })
                  )
                ).join('\n')
            response.statusCode = 200
            response.setHeader('Content-Type', 'text/css')
            response.end(css)
            return
          }

          if (pathname === '/__baseline-remix.css') {
            const cssPath = packageRoot
              ? resolve(packageRoot, 'dist/remix.css')
              : resolve(
                  server.config.root,
                  '../../packages/remix/src/styles.css'
                )
            response.statusCode = 200
            response.setHeader('Content-Type', 'text/css')
            response.end(await readFile(cssPath, 'utf8'))
            return
          }

          if (pathname !== '/' && pathname !== '/remix.html') {
            next()
            return
          }

          try {
            const isRemix = pathname === '/remix.html'
            const template = await readFile(
              resolve(
                server.config.root,
                isRemix ? 'remix.html' : 'index.html'
              ),
              'utf8'
            )
            const renderModule = await server.ssrLoadModule(
              isRemix ? '/remix-ssr.ts' : '/ssr.tsx'
            )
            const rendered = isRemix
              ? await renderModule.renderRemixApp()
              : renderModule.renderApp()
            const html = await server.transformIndexHtml(
              request.url,
              template.replace('<!--app-html-->', rendered)
            )

            response.statusCode = 200
            response.setHeader('Content-Type', 'text/html')
            response.end(html)
          } catch (error) {
            server.ssrFixStacktrace(error as Error)
            next(error)
          }
        })
      },
    },
  ],
  resolve: {
    alias: [
      ...(packageRoot
        ? [
            // The packed fixture owns its Remix installation. Vite aliases
            // bypass package exports, so point the public subpath imports at
            // the installed distribution files explicitly. Keeping these
            // files on the same Remix instance is required for the server
            // renderer's Frame identity to match client hydration.
            {
              find: /^@baseline-kit\/remix\/server$/,
              replacement: resolve(packageRoot, 'dist/remix-server.mjs'),
            },
            {
              find: /^@baseline-kit\/remix$/,
              replacement: resolve(packageRoot, 'dist/remix.mjs'),
            },
            {
              find: /^@baseline-kit\/react$/,
              replacement: resolve(packageRoot, 'dist/index.mjs'),
            },
            {
              find: /^remix\/ui\/jsx-runtime$/,
              replacement: resolve(
                packageRoot,
                '..',
                'remix',
                'dist',
                'ui',
                'jsx-runtime.js'
              ),
            },
            {
              find: /^remix\/ui$/,
              replacement: resolve(packageRoot, '..', 'remix', 'dist', 'ui.js'),
            },
          ]
        : [
            {
              find: '@baseline-kit/remix/server',
              replacement: resolve(
                import.meta.dirname,
                '../../packages/remix/src/server.ts'
              ),
            },
          ]),
      ...Object.entries(alias).map(([find, replacement]) => ({
        find,
        replacement,
      })),
    ],
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[local]_[hash:base64:5]',
    },
    transformer: 'postcss',
  },
  server: {
    fs: {
      allow: ['../..', ...(packageRoot ? [packageRoot] : [])],
    },
  },
})
