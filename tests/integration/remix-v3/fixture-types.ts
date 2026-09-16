import type { RemixNode } from 'remix/ui'
import {
  renderToStream,
  renderToString,
  ImportMap,
  type RenderToStreamOptions,
} from 'baseline-kit/remix/server'

type IsNotAny<T> = 0 extends 1 & T ? never : true
export const typedStream: IsNotAny<typeof renderToStream> = true
export const typedString: IsNotAny<typeof renderToString> = true
export const typedImportMap: IsNotAny<typeof ImportMap> = true
// @ts-expect-error Arbitrary data objects are not renderable nodes.
renderToStream({ invalid: true })

export const serverOptions: RenderToStreamOptions = {
  frameSrc: 'https://example.test/',
}
export const serverStream: ReadableStream<Uint8Array> = renderToStream(
  null,
  serverOptions
)
import type {
  BaselineProps,
  BoxProps,
  ConfigProps,
  GuideProps,
  PadderProps,
  SpacerProps,
} from 'baseline-kit/remix'

const child: RemixNode = null

export const config: ConfigProps = {
  base: 8,
  baseline: { debugging: 'visible' },
  children: child,
}

export const baseline: BaselineProps = {
  width: '50%',
  height: 'calc(100% - 24px)',
  debugging: 'visible',
}

export const box: BoxProps = { span: 2 }
export const guide: GuideProps = { variant: 'fixed', columns: 4 }
export const padder: PadderProps = { padding: [8, 16] }
export const spacer: SpacerProps = { variant: 'flat', height: 16 }
