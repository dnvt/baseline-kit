/**
 * Node-only SSR compatibility entry for remix 3.0.0-rc.2 / @remix-run/ui 0.9.0.
 * Loads a corrected, isolated instance of the upstream MIT-licensed renderer.
 * No installed files, module hooks, or upstream exports are modified.
 */
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import type * as RemixServer from 'remix/ui/server'

const requireFromKit = createRequire(import.meta.url)
const requireFromRemix = createRequire(
  requireFromKit.resolve('remix/ui/server')
)
const serverPath = requireFromRemix.resolve('@remix-run/ui/server')
const serverURL = pathToFileURL(serverPath)
const source = await readFile(serverPath, 'utf8')

// Fail closed on changed upstream internals. A version string alone does not
// establish compatibility with the private imports this renderer uses.
const expectedDigest =
  '59aba1ebb68fac46a957cafd130611e1ed4fdfbec48239fde770876c7e0642bf'
if (createHash('sha256').update(source).digest('hex') !== expectedDigest) {
  throw new Error(
    'baseline-kit/remix/server requires the unmodified @remix-run/ui@0.9.0 renderer from remix@3.0.0-rc.2. Revalidate this compatibility entry before upgrading Remix.'
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

// Keep all runtime helpers, Frame identity and mixin state in the application's
// original Remix installation. Only the server renderer instance is corrected.
const correctedSource = source
  .replace(before, after)
  .replace(
    /from (['"])(\.\.?\/[^'"]+)\1/g,
    (_match, _quote, specifier: string) =>
      `from ${JSON.stringify(new URL(specifier, serverURL).href)}`
  )
const moduleURL = `data:text/javascript;base64,${Buffer.from(`${correctedSource}\n//# sourceURL=baseline-kit-remix-server-0.9.0.mjs`).toString('base64')}`
const renderer = (await import(
  /* @vite-ignore */ moduleURL
)) as typeof import('remix/ui/server')

export const renderToStream: typeof RemixServer.renderToStream =
  renderer.renderToStream
export const renderToString: typeof RemixServer.renderToString =
  renderer.renderToString
// ImportMap must come from the same renderer: upstream recognizes it by identity.
export const ImportMap: typeof RemixServer.ImportMap = renderer.ImportMap
export type {
  RenderToStreamOptions,
  ResolveFrameContext,
  ImportMapData,
  ImportMapProps,
} from 'remix/ui/server'
