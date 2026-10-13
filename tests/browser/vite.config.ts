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
          if (pathname === '/__baseline.css') {
            const cssPath = packageRoot
              ? resolve(packageRoot, 'dist/styles.css')
              : resolve(
                  server.config.root,
                  '../../packages/core/src/styles/baseline-kit.css'
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
              ? await renderModule.renderRemixApp(request.url)
              : renderModule.renderApp(request.url)
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
            // the installed distribution files explicitly. Keeping server
            // rendering and browser hydration on the same Remix instance is
            // required for native Frame identity and registration.
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
              find: /^remix\/component\/jsx-runtime$/,
              replacement: resolve(
                packageRoot,
                '..',
                'remix',
                'dist',
                'component',
                'jsx-runtime.js'
              ),
            },
            {
              find: /^remix\/component\/server$/,
              replacement: resolve(
                packageRoot,
                '..',
                'remix',
                'dist',
                'component',
                'server.js'
              ),
            },
            {
              find: /^remix\/component$/,
              replacement: resolve(
                packageRoot,
                '..',
                'remix',
                'dist',
                'component.js'
              ),
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
  server: {
    fs: {
      allow: ['../..', ...(packageRoot ? [packageRoot] : [])],
    },
  },
})
