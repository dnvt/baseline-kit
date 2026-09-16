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
          if (pathname === '/__baseline-react.css' && packageRoot) {
            response.statusCode = 200
            response.setHeader('Content-Type', 'text/css')
            response.end(
              await readFile(resolve(packageRoot, 'dist/styles.css'), 'utf8')
            )
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
    ...(packageRoot
      ? [
          {
            name: 'baseline-browser-package-css',
            transformIndexHtml(html: string) {
              return html.replace(
                '</head>',
                '    <link rel="stylesheet" href="/__baseline-react.css" />\n  </head>'
              )
            },
          },
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@baseline-kit/remix/server': packageRoot
        ? resolve(packageRoot, 'dist/remix-server.mjs')
        : resolve(import.meta.dirname, '../../packages/remix/src/server.ts'),
      ...alias,
      ...(packageRoot
        ? {
            '@baseline-kit/react': resolve(packageRoot, 'dist/index.mjs'),
            '@baseline-kit/remix': resolve(packageRoot, 'dist/remix.mjs'),
          }
        : {}),
    },
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
