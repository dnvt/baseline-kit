/**
 * Node-only Remix 3 server compatibility entry.
 *
 * Remix 3.0.0 loses the current parent VNode while serializing a component's
 * return value. That drops nested provider context inside client-entry props.
 * Keep a small, exact-source patch isolated to this Node entry; the public
 * component runtime and all client/server component identities stay shared.
 */
import { createHash } from 'node:crypto'
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

// Fail closed when Remix's private server implementation changes. The
// workspace pins remix@3.0.0; revalidate this small patch on any upgrade.
const expectedDigest =
  'e68ea36b071142a01a7733862b21f50f4973ec133a6890576e8356ad3f1159d1'
if (createHash('sha256').update(source).digest('hex') !== expectedDigest) {
  throw new Error(
    'baseline-kit/remix/server requires the verified Remix 3.0.0 component server. Revalidate this compatibility entry before upgrading Remix.'
  )
}

const before = `            let [renderedNode] = handle.render(props);
            return unwrapNode(renderedNode);`
const after = `            let [renderedNode] = handle.render(props);
            let previousParent = context.parentVNode;
            context.parentVNode = vnode;
            try {
                return unwrapNode(renderedNode);
            } finally {
                context.parentVNode = previousParent;
            }`
if (!source.includes(before)) {
  throw new Error(
    'baseline-kit/remix/server could not locate the verified Remix serialization boundary.'
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
const moduleURL = `data:text/javascript;base64,${Buffer.from(`${correctedSource}\n//# sourceURL=baseline-kit-remix-server-3.0.0.mjs`).toString('base64')}`
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
