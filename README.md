# Baseline Kit

![Build Status](https://img.shields.io/github/actions/workflow/status/dnvt/baseline-kit/test.yml)
![npm version](https://img.shields.io/npm/v/baseline-kit)
![License](https://img.shields.io/github/license/dnvt/baseline-kit)

Baseline Kit grew from my [Padded Grid article](https://medium.com/design-bootcamp/the-padded-grid-a-designers-hack-to-achieve-baseline-fit-fc40d022bc84),
which explores aligning text baselines and component bounds to an 8px grid.
Baseline Kit turns that idea into a reusable pattern: wrap text in `Box` with
`snapping="height"` and `snapEdge="top"`.

The pattern relies on the CSS
[`text-box-trim`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-box-trim)
property. `Box` sets `text-box-trim: trim-both` with
`text-box-edge: ex alphabetic`, which cuts each text element down to the space
between its x-height and its alphabetic baseline. The text's measured height
then ends exactly on its baseline. Height snapping rounds the Box up to the
next grid interval, and top snapping puts that correction above the text, so
the baseline lands on the grid.

`Baseline` and `Guide` draw the grid; `Padder`, `Spacer`, and `Config` handle
spacing and defaults.

The same components, props, and stylesheet work in React 19 and in Remix 3
without React.

![Demo visual](https://raw.githubusercontent.com/dnvt/baseline-kit/main/kit.png)

## Install

```shell
npm install baseline-kit react@19 react-dom@19   # React
npm install baseline-kit remix@3                 # Remix 3, no React
```

React and Remix are optional peer dependencies; install the one you use.
TypeScript declarations are included (TypeScript 5.8, 6, or 7). The React entry
runs on Node.js 18+; Remix 3 requires Node.js 24.3+.

## Quick start

Import the stylesheet once, then use the components. In React:

```tsx
import 'baseline-kit/styles'
import 'baseline-kit/theme'
import { Baseline, Box, Config, Guide } from 'baseline-kit'

export function App() {
  return (
    <Config base={8}>
      <main style={{ position: 'relative', minHeight: '100vh' }}>
        <Baseline height="100%" debugging="visible" />
        <Guide variant="fixed" columns={12} debugging="visible" />
        <Box as="h1" snapping="height" snapEdge="top">
          Text on the 8px baseline grid
        </Box>
      </main>
    </Config>
  )
}
```

In Remix 3, import the components from `baseline-kit/remix` instead. They
render through `remix/component` and never load React:

```tsx
/** @jsxImportSource remix/component */
import { Box, Config } from 'baseline-kit/remix'

export function App() {
  return () => (
    <Config base={8}>
      <Box as="h1" snapping="height" snapEdge="top">
        Text on the 8px baseline grid
      </Box>
    </Config>
  )
}
```

Remix 3 server modules run in plain Node, which cannot import CSS. Serve the
stylesheet through Remix's asset server instead and link it in the document
head. Allow both `remix` and `baseline-kit`: the Baseline Kit client entries
import `remix/component`, so the browser loads both packages.

```ts
// app/assets.ts
import { fileURLToPath } from 'node:url'
import { createAssetServer } from 'remix/assets'

export const assetServer = createAssetServer({
  basePath: '/assets',
  rootDir: process.cwd(),
  allowFiles: ['app/**/public/**'],
  allowPackages: ['remix', 'baseline-kit'],
})

// import.meta.resolve returns a file:// URL; getHref takes a path.
export const baselineKitStylesHref = await assetServer.getHref(
  fileURLToPath(import.meta.resolve('baseline-kit/styles'))
)
```

Render `<link rel="stylesheet" href={baselineKitStylesHref} />` in the
document head, and link `baseline-kit/theme` the same way if you use it.

## Text on the baseline grid

`Box` is meant to wrap text: a heading, a paragraph, a label, or a single line
of copy. It applies `text-box-trim: trim-both` and
`text-box-edge: ex alphabetic` to its content and to each direct child.
`Padder` trims only its own content wrapper. This is what makes the alignment
work. Without
trimming, a line of text includes the font's ascender and descender space, so
its height says nothing about where the baseline sits. Trimmed from the
x-height to the alphabetic baseline, the text ends exactly on its baseline, and
`snapEdge="top"` adds the height correction above it. When the Box starts on a
grid line and its bottom padding is a multiple of the base, the baseline lands
on the grid.

```tsx
<Box snapping="height" snapEdge="top">
  <p>Body copy sits on the grid.</p>
</Box>
<Box as="h2" snapping="height" snapEdge="top">
  So does this heading.
</Box>
```

Trimmed text has no space above or below its glyphs, so separate stacked
paragraphs with margins that are multiples of the base. Text nested deeper
than a direct child needs the same two properties:
`text-box-edge` inherits but `text-box-trim` does not. For multiline text, set
`line-height` to a multiple of the base, in the base's unit: `24px` on an 8px
base, `1.5rem` on a `0.5rem` base. Lines then stay a whole number of rows
apart, and a rem line-height keeps pace with a rem base when the text size
changes; any other line-height lets interior lines drift between grid lines.
Browsers without text-box support keep their normal text metrics. See the
[text-box-edge reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-box-edge).

## Spacing and snapping

The base interval is `8px` by default; set it with `Config base={...}`.
To follow the reader's text size, give it in rem: `Config base="0.5rem"` makes
the grid half the root font size (8px at the default 16px, 10px at 20px). The
base follows the root font size, whether a stylesheet or the reader's default
font size sets it, and when that changes every `Box` and `Padder` re-snaps.
Give `line-height` in rem too (see
[Text on the baseline grid](#text-on-the-baseline-grid)). The server has no root
font size, so it renders a rem base at 16px; the client hydrates that HTML and
then switches to the live size. `ConfigSchema.base` is always the resolved
value in px, and `baseRem` holds the rem value. A base that isn't a whole
number of layout units (0.5rem at a 15.3px root is 7.65px) can only be
approximated: each `Box` lands within 1/32px of the grid, and the differences
add up down a stack of Boxes.

Sizes you fix in px don't grow with the reader's text. A `Box` with a fixed
`height` keeps it when the text gets larger, so the text overflows; let text
Boxes size from their content, or give the height in rem.

The stylesheet also sets `--bk-base: 8px` on `:root` for your own CSS. It
stays 8px whatever the `Config` base, and Baseline Kit doesn't read it, so
changing it doesn't move the grid; set the base with `Config`.

Numeric spacing values are CSS pixels, not multiples of the base:

```tsx
<Padder block={[16, 24]} inline={{ start: 8, end: 16 }}>
  Content
</Padder>
```

Spacing props follow CSS shorthand: `padding={16}` sets all sides,
`padding={[8, 16]}` sets block and inline, and three- or four-value arrays work
as in CSS. `block` and `inline` set start/end pairs as arrays or objects.

`Box` snapping modes:

| `snapping` | Effect |
| --- | --- |
| `clamp` (default) | Keeps block padding under one base and corrects the bottom so the height lands on the grid. |
| `height` | Keeps your padding and rounds the height up to the next base interval. |
| `none` | Keeps the padding you set. |

In `height` mode the correction goes to the bottom by default;
`snapEdge="top"` puts it above the content. `Box` measures its whole element,
including its own border and padding, with fractional-pixel precision.
Browsers lay out in whole units (1/64px in Chromium and WebKit, 1/60px in
Firefox), and any remainder made of those units is snapped exactly. Browser
zoom, display scaling, and CSS `zoom` leave smaller, fractional residues; up to
1/32px those count as on the grid, because snapping them would add a whole base
row. CSS `zoom` on an ancestor is taken into account; a CSS `transform` that
scales an ancestor is not.

A `Box` or `Padder` snaps after its first nonzero measurement, whenever its
base, padding, or snapping props change, and whenever its content height
changes: a web font loading, a font or size change, text rewrapping at a new
width, or a new root font size. It snaps from its content's height and the
padding it actually renders, so for a Box whose height follows its content,
its own correction, or a CSS transition on that padding, doesn't set off
another snap. When a height set from outside wins (a fixed `height`, a taller
`min-height`, a stretched flex or grid item), padding can only bring the Box
onto the grid by growing it past that height, which takes a few updates;
otherwise the Box keeps the outside height. Padding grown this way stays until
the Box's height next changes.
`Padder` uses height snapping with a bottom correction. A `Box` or `Padder`
nested inside a `Box` doesn't snap on its own; the outer `Box` snaps the whole. Set `ssrMode` on
either to keep the explicit padding without measuring.

### Sizes as CSS lengths

`Spacer` and `Guide` take sizes as numbers, in px, or as CSS length strings.
A `Spacer` height such as `'3rem'`, `'10vh'`, `'50%'` or `'calc(100% - 24px)'`
rounds to the base in CSS (with `round()`), so it follows the root font size,
the viewport, and its container as they change; under a rem base it rounds to
the rem value. A string width renders as written. Live strings use px, rem,
em, ex, ch, `%`, the viewport units, and the absolute units, alone or inside
`calc()`, `min()`, `max()`, `clamp()` and `var()`. Anything else (`'auto'`,
`'24'`, keywords, newer units such as `lh` or `cqw`, or malformed math such as
`'calc(100%-23px)'`) falls back to the base. Browsers without CSS `round()`
(before Chrome 125, Firefox 118 and Safari 15.4) keep the px height the kit
computes without a page: units against a 16px root and a 1920x1080 viewport,
`%` as 0px, and `calc()` or `var()` as the base.

A `Guide` `gap` such as `'1rem'` or `'2%'` resolves when the Guide renders
(on mount, when its size changes, and for a rem `gap` or `columnWidth`, when
the root font size changes) against the root font size, the viewport, and the
Guide's own width, then rounds to the base. It reads px, rem, `%`, the
viewport units (`vw`, `vh`, `vi`, `vb`, `vmin`, `vmax`, and their `s`, `l` and
`d` forms), `in`, `cm`, `mm`, `pt` and `pc`, in any letter case; `em` resolves
against 16px, and anything else, including `calc()`, falls back to the base.

### Semantic elements

`as` renders `Box` as a heading, `p`, `label`, `legend`, `small`, `span`, or
`strong` instead of a `div`. Your `className`, `style`, `width`, and `height`
stay on that element and the snapped grid sits inside it. Pass `htmlFor` with
`as="label"`. A semantic host drops the element's default block margins so
that they don't sit outside the snapped height; add your own as multiples of
the base. The reset outweighs element resets such as normalize.css, and a
class of your own loaded after Baseline Kit's stylesheet wins over it.

Utilities in a cascade layer, such as Tailwind's, lose to unlayered CSS. To let
them override Baseline Kit, put it in a layer after your resets and before your
utilities. With Tailwind v4:

```css
@layer theme, base, baseline-kit, components, utilities;
@import 'tailwindcss';
@import 'baseline-kit/styles' layer(baseline-kit);
```

A layer declared before `base` would let Tailwind's preflight reset Baseline
Kit's own margins and borders. In a layer, Baseline Kit also loses to
unlayered element rules such as normalize.css; put those in a layer before
`baseline-kit` too.

## Components

| Component | Purpose |
| --- | --- |
| `Baseline` | Horizontal baseline-grid overlay. |
| `Guide` | Responsive or fixed column-grid overlay. |
| `Box` | Wraps text, trims it to its baseline, and snaps its height to the grid. |
| `Padder` | Adds baseline-aware padding. |
| `Spacer` | Adds space; numbers and string heights round to the base. |
| `Config` | Sets scoped base, colors, variants, and debugging defaults. |

`debugging` can be `visible`, `hidden`, or `none`: show the debug paint, hide
it but keep the layout, or render no debug elements. `Baseline` and `Guide` are
`aria-hidden` overlays, so keep meaningful content outside them. Diagnostic
`data-*` attributes are off by default; turn them on for a subtree with
`<Config domDiagnostics>`.

## Entry points

| Import | Contents |
| --- | --- |
| `baseline-kit` | React components. |
| `baseline-kit/remix` | Remix 3 components, without React. |
| `baseline-kit/remix/server` | Node.js server renderer for Remix 3 (see below). |
| `baseline-kit/core` | Framework-free types, config, and spacing math. |
| `baseline-kit/styles` | Required component styles, shared by React and Remix. |
| `baseline-kit/theme` | Optional colors that follow `prefers-color-scheme`. |
| `baseline-kit/theme/default`, `baseline-kit/theme/dark` | A fixed light or dark theme. |
| `baseline-kit/reset` | Optional minimal CSS reset. |

Components use global `bk-*` class names, and every rule weighs one class,
so plain CSS loaded after `baseline-kit/styles` overrides them. For custom colors, use `Config` or copy the
[theme token template](https://github.com/dnvt/baseline-kit/blob/main/packages/core/src/styles/theme/tokens.css).

## Remix 3 server rendering

For Node.js server rendering, import `renderToStream`, `renderToString`, and
`ImportMap` from `baseline-kit/remix/server` instead of
`remix/component/server`. Remix 3 loses provider context while serializing
component-valued children. This entry patches that step in an isolated copy of
the renderer, and fails at startup if the code it patches is no longer there.
It reads the installed Remix runtime from disk, so keep those files in
production. `Frame` and client components still come from `remix/component`.

Render pages that hydrate with `renderToStream`, and pass a
`resolveClientEntry` callback that maps every client entry, including
Baseline Kit's and your app's, to a JavaScript asset the browser can load (for
example through the asset server above). `renderToString` takes no options, so
it cannot resolve client entries: use it only for HTML that won't hydrate.

Remix's `render()` middleware from `remix/middleware/render` imports the
unpatched renderer itself and can't be pointed at this one. If a `Config` sits
inside the children of a client entry, render that page with this entry's
`renderToStream` directly; otherwise the nested `Config` is lost on the
server.

See the [server resolver example](https://github.com/dnvt/baseline-kit/blob/main/tests/browser/remix-ssr.ts)
and the [asset-serving fixture](https://github.com/dnvt/baseline-kit/blob/main/tests/browser/vite.config.ts).

## Upgrading from 6.x

Version 7 ships one stylesheet and fewer entry points. See the
[changelog](https://github.com/dnvt/baseline-kit/blob/main/CHANGELOG.md) for
the full list.

| 6.x | 7.x |
| --- | --- |
| `import 'baseline-kit/styles/remix'` (Remix) | Link `baseline-kit/styles` in the document head (see [Quick start](#quick-start)) |
| `baseline-kit/styles/full`, `baseline-kit/full` | `baseline-kit/styles` and `baseline-kit/theme` |
| `baseline-kit/styles/reset` | `baseline-kit/reset` |
| `baseline-kit/guide`, `baseline-kit/styles/guide` | `baseline-kit`, `baseline-kit/styles` |
| `<Box as="label" for="…">` (Remix) | `<Box as="label" htmlFor="…">` |

## Contributing and license

See [CONTRIBUTING.md](https://github.com/dnvt/baseline-kit/blob/main/CONTRIBUTING.md).
Baseline Kit is MIT licensed. © [François Denavaut](https://github.com/dnvt).
