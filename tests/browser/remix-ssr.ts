import { renderToStream } from '@baseline-kit/remix/server'
import { createRemixApp } from './remix-app'

function renderLifecycleFrame(src: string) {
  const version = src.endsWith('-b') ? 'b' : 'a'
  return `<section id="remix-frame-server-view" data-remix-frame-view="${version}"><p>Server frame ${version}</p></section>`
}

export async function renderRemixApp(url = '/remix.html') {
  const search = new URL(url, 'http://ssr').search
  const stream = renderToStream(createRemixApp(search), {
    resolveFrame: (src) => renderLifecycleFrame(src),
    resolveClientEntry: async (entryId, component) => ({
      // This is the fixture's app-owned asset resolver. The browser then
      // imports this public module URL through the runtime loader.
      href: '/remix-module.js',
      exportName: entryId.slice(entryId.lastIndexOf('#') + 1) || component.name,
      preloads: [],
    }),
  })

  return new Response(stream).text()
}
