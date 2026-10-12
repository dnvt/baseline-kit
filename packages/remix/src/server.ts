/**
 * Node-only Remix 3 server compatibility entry.
 *
 * Remix 3 loses the current parent VNode while serializing a component's
 * return value. That drops nested provider context inside client-entry props.
 * Keep a small source patch isolated to this Node entry; the public component
 * runtime and all client/server component identities stay shared.
 */
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import type * as RemixServer from 'remix/component/server'

const requireFromKit = createRequire(import.meta.url)
const requireFromRemix = createRequire(
  requireFromKit.resolve('remix/package.json')
)
const serverEntry = requireFromRemix.resolve('@remix-run/component/server')
const serverURL = new URL('./server/stream.js', pathToFileURL(serverEntry))
const sourcePath = fileURLToPath(serverURL)
const source = await readFile(sourcePath, 'utf8')

const before = `            vnode._handle = handle;
            let [renderedNode] = handle.render(props);
            return unwrapNode(renderedNode);`
const after = `            vnode._handle = handle;
            let [renderedNode] = handle.render(props);
            let previousParent = context.parentVNode;
            context.parentVNode = vnode;
            try {
                return unwrapNode(renderedNode);
            } finally {
                context.parentVNode = previousParent;
            }`
// Patch by anchor rather than by file digest: Remix 3 accepts any
// @remix-run/component 1.x, so the file can change while this boundary stays.
// The patch reads `context` and `vnode` from the hydration props replacer, so
// require that scope, its parent link, and exactly one anchor inside it.
// Fail closed when any of them moves.
const scope = source.indexOf('function createHydrationPropsReplacer(context,')
const parentLink = source.indexOf('vnode._parent = context.parentVNode;', scope)
const anchor = source.indexOf(before, parentLink)
if (
  scope < 0 ||
  parentLink < 0 ||
  anchor < 0 ||
  source.indexOf(before, anchor + before.length) >= 0 ||
  source.indexOf(before) !== anchor
) {
  throw new Error(
    'baseline-kit/remix/server could not locate the Remix serialization boundary it patches. Check this entry against the installed @remix-run/component version.'
  )
}

// Reuse Remix's own component runtime modules so Frame and client-entry
// identities remain shared with the application.
const correctedSource = source
  .replace(before, after)
  .replace(
    /from (['"])(\.\.?\/[^'"]+)\1/g,
    (_match, _quote, specifier: string) =>
      `from ${JSON.stringify(new URL(specifier, serverURL).href)}`
  )
const moduleURL = `data:text/javascript;base64,${Buffer.from(`${correctedSource}\n//# sourceURL=baseline-kit-remix-server.mjs`).toString('base64')}`
const renderer = (await import(
  /* @vite-ignore */ moduleURL
)) as typeof import('remix/component/server')

export const renderToStream: typeof RemixServer.renderToStream =
  renderer.renderToStream
export const renderToString: typeof RemixServer.renderToString =
  renderer.renderToString
export const ImportMap: typeof RemixServer.ImportMap = renderer.ImportMap
export type {
  ImportMapData,
  ImportMapProps,
  RenderToStreamOptions,
  ResolveFrameContext,
} from 'remix/component/server'
