# Baseline Kit

![Build Status](https://img.shields.io/github/actions/workflow/status/dnvt/baseline-kit/test.yml)
![npm version](https://img.shields.io/npm/v/baseline-kit)
![License](https://img.shields.io/github/license/dnvt/baseline-kit)

Put text on a baseline grid, and keep it there.

Text rarely lines up with a grid: a line box includes the font's ascender and
descender space, so its height says nothing about where the baseline sits.
Baseline Kit fixes that, following my
[Padded Grid article](https://medium.com/design-bootcamp/the-padded-grid-a-designers-hack-to-achieve-baseline-fit-fc40d022bc84).
`Box` trims its text to the baseline with CSS
[`text-box-trim`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-box-trim),
measures it, and pads it so its height is a whole number of grid rows. Stack
Boxes and every baseline lands on the grid. It keeps them there as fonts load,
text rewraps, or the reader changes their text size.

The same components and stylesheet work in React 19 and in Remix 3 without
React.

![Demo visual](https://raw.githubusercontent.com/dnvt/baseline-kit/main/kit.png)

## Install

```shell
npm install baseline-kit react@19 react-dom@19   # React
npm install baseline-kit remix@3                 # Remix 3, no React
```

React runs on Node.js 18+; Remix 3 needs Node.js 24.3+.

## Quick start

```tsx
import 'baseline-kit/styles'
import 'baseline-kit/theme' // optional colors
import { Baseline, Box, Config } from 'baseline-kit'

export function App() {
  return (
    <Config base={8}>
      <main style={{ position: 'relative' }}>
        <Baseline height="100%" debugging="visible" />
        <Box as="h1" snapping="height" snapEdge="top">
          A heading on the grid
        </Box>
        <Box snapping="height" snapEdge="top">
          <p>Body copy on the grid.</p>
        </Box>
      </main>
    </Config>
  )
}
```

In Remix 3, import from `baseline-kit/remix` and link the stylesheet in the
document head (server modules can't import CSS). Serve it with Remix's asset
server, allowing both packages:

```ts
import { fileURLToPath } from 'node:url'
import { createAssetServer } from 'remix/assets'

export const assetServer = createAssetServer({
  basePath: '/assets',
  rootDir: process.cwd(),
  allowFiles: ['app/**/public/**'],
  allowPackages: ['remix', 'baseline-kit'],
})
export const stylesHref = await assetServer.getHref(
  fileURLToPath(import.meta.resolve('baseline-kit/styles'))
)
```

For server rendering, import `renderToStream` from `baseline-kit/remix/server`
instead of `remix/component/server`, so `Config` reaches client entries (see
the [server example](https://github.com/dnvt/baseline-kit/blob/main/tests/browser/remix-ssr.ts)).

## Keeping text on the grid

- **Wrap text in `Box`** with `snapping="height"` and `snapEdge="top"`: the
  correction goes above the text, so its baseline lands on a grid line.
- **Give `line-height` in multiples of the base** (`24px` on an 8px base) so
  every line of a paragraph stays on the grid, and space stacked Boxes with
  margins that are multiples of the base.
- **Follow the reader's text size** with a rem base: `Config base="0.5rem"`
  makes the grid half the root font size, and `line-height: 1.5rem` keeps
  lines on it. The server renders it at 16px; the client switches to the live
  size.
- **Let Boxes size from their content.** They re-snap whenever it changes; a
  fixed `height` can't grow with larger text.

`Box` snapping modes: `clamp` (default) keeps block padding under one base and
corrects the bottom; `height` keeps your padding and rounds the height up;
`none` keeps the padding you set. `as` renders a Box as a heading, `p`,
`label`, or another text element.

Browsers without `text-box` support keep their normal text metrics. A base
that isn't a whole number of layout units (0.5rem at a 15.3px root) is
approximated: each Box lands within 1/32px, and the differences add up down a
long stack.

## Components

| Component | Purpose |
| --- | --- |
| `Box` | Wraps text, trims it to its baseline, and snaps its height to the grid. |
| `Baseline` | Horizontal baseline-grid overlay. |
| `Guide` | Column-grid overlay. |
| `Padder` | Padding that snaps to the grid. |
| `Spacer` | Space; its height rounds to the base. |
| `Config` | Scoped base, colors, and debugging defaults. |

Sizes are numbers in px, or CSS lengths such as `'3rem'` or `'50%'` that
follow the page; Spacer heights and Guide gaps round to the base. `debugging`
is `visible`, `hidden` (layout kept), or `none`.

## Styling

Import `baseline-kit/styles` once (`baseline-kit/theme` adds light and dark
colors; `baseline-kit/reset` is an optional reset). Every rule weighs one
class, so your own CSS loaded after it wins. With Tailwind v4, put it in a
layer before your utilities:

```css
@layer theme, base, baseline-kit, components, utilities;
@import 'tailwindcss';
@import 'baseline-kit/styles' layer(baseline-kit);
```

## More

- Upgrading from 6.x, and every change: the
  [changelog](https://github.com/dnvt/baseline-kit/blob/main/CHANGELOG.md).
- [Contributing](https://github.com/dnvt/baseline-kit/blob/main/CONTRIBUTING.md).

MIT licensed. © [François Denavaut](https://github.com/dnvt).
