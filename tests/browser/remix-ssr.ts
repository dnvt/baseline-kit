import { renderToStream } from '@baseline-kit/remix/server'
import { createRemixApp } from './remix-app'

export async function renderRemixApp() {
  const stream = renderToStream(createRemixApp(), {
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
