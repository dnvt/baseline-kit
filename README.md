# Baseline Kit

![Build Status](https://img.shields.io/github/actions/workflow/status/dnvt/baseline-kit/test.yml)
![npm version](https://img.shields.io/npm/v/baseline-kit)
![License](https://img.shields.io/github/license/dnvt/baseline-kit)

Baseline Kit is a development overlay and spacing toolkit for React 19. It
provides baseline and column grids, spacing primitives, scoped configuration,
and themeable debug visuals. It also ships a React-free adapter for the Remix 3
UI runtime.

![Demo visual](https://raw.githubusercontent.com/dnvt/baseline-kit/main/kit.png)

## What it includes

- **`Baseline`** — a horizontal baseline-grid overlay.
- **`Guide`** — a column-grid overlay with line, pattern, fixed, and auto modes.
- **`Box`**, **`Padder`**, and **`Spacer`** — spacing primitives that can align
  content to the baseline grid.
- **`Config`** — scoped defaults for the base unit, colors, variants, and
  debugging visibility.
- **React-free Remix support** — native `remix/ui` components with SSR,
  hydration, measurement, and cleanup support.

## Requirements

- React 19 for the default and `baseline-kit/guide` entries.
- The React/core package declares Node.js 18+; native Remix requires
  `remix@3.0.0-rc.2` and its Node.js 24.3+ runtime. Other Remix versions need
  a compatibility check. Repository development requires Node.js 24.15+.
- TypeScript 5.8+, 6, or 7 when using TypeScript.
- A modern browser with CSS Grid and CSS custom property support.

## Installation

```shell
npm install baseline-kit react@19 react-dom@19
# or
bun add baseline-kit react@19 react-dom@19
```

Choose the smallest entry point that matches the application:

| Use case                        | JavaScript entry     | CSS entry                                           |
| ------------------------------- | -------------------- | --------------------------------------------------- |
| React components                | `baseline-kit`       | `baseline-kit/styles` plus `baseline-kit/theme`     |
| React guide only                | `baseline-kit/guide` | `baseline-kit/styles/guide`                         |
| React-free Remix 3 UI           | `baseline-kit/remix` | `baseline-kit/styles/remix`                         |
| Framework-independent utilities | `baseline-kit/core`  | None                                                |
| All React styles and theme      | —                    | `baseline-kit/styles/full`                          |
| Optional reset                  | —                    | `baseline-kit/reset` or `baseline-kit/styles/reset` |

Baseline Kit includes its own TypeScript declarations. React and Remix remain
optional peer dependencies, so an application only installs the runtime it
uses.

## Quick start

```tsx
import 'baseline-kit/styles'
import 'baseline-kit/theme'
import { Baseline, Box, Config, Guide } from 'baseline-kit'

export function App() {
  return (
    <Config
      base={8}
      baseline={{ debugging: 'visible' }}
      guide={{ debugging: 'visible' }}
      box={{ debugging: 'visible' }}
    >
      <main style={{ position: 'relative', height: '100vh' }}>
        <Baseline height="100%" />
        <Guide variant="fixed" columns={12} width="100%" />
        <Box block={[16, 24]} snapping="height">
          Content aligned to the grid
        </Box>
      </main>
    </Config>
  )
}
```

## Core concepts

### Base unit and sizing

`base` is the baseline interval in CSS pixels; it defaults to `8`. Numeric
spacing values are CSS pixel values, not multipliers. CSS dimensions such as
`100vh`, `50%`, `1rem`, and `calc(...)` on Baseline dimensions remain relative
and are resolved by the browser. Overlays are absolutely positioned: give their
parent `position: relative` and a definite height for percentage heights.

```tsx
<Config base={8}>
  <Padder block={[16, 24]} inline={{ start: 8, end: 16 }}>
    Content
  </Padder>
</Config>
```

Spacing props accept the following shapes:

- `padding={16}` — all four sides.
- `padding={[8, 16]}` — 8px top/bottom and 16px left/right; three- and
  four-value arrays follow CSS padding shorthand.
- `block={[16, 24]}` — block-start and block-end.
- `inline={{ start: 8, end: 16 }}` — inline-start and inline-end.

### Grid snapping

`Box` defaults to `snapping="clamp"`. `height` adds bottom spacing to round the
measured height up to the next base interval; `clamp` also reduces the top and
bottom spacing modulo the base. Use `snapping="none"` to keep explicit spacing.
Snapping happens once after the first nonzero measurement, not continuously on
resize. `Padder` uses height snapping in both adapters. Set `ssrMode` on Padder
to retain explicit padding without applying its measured snap.

### Debugging modes

Every visual component supports one of these modes:

- `visible` — render and show the debug visual.
- `hidden` — hide debug paint while preserving content and spacing.
- `none` — disable debug paint and use ordinary padding instead of debug spacers.

Baseline and Guide keep an empty host in both hidden modes. They are debug
overlays marked `aria-hidden`; keep meaningful application content outside them.

## Components

| Component  | Purpose                                                       |
| ---------- | ------------------------------------------------------------- |
| `Config`   | Supplies scoped base, variant, color, and debugging defaults. |
| `Baseline` | Renders horizontal baseline rows.                             |
| `Guide`    | Renders a responsive or fixed column guide.                   |
| `Box`      | Wraps content and optionally snaps its measured height.       |
| `Padder`   | Adds baseline-aware padding and optional measurement spacers. |
| `Spacer`   | Adds a fixed-size spacer with an optional debug indicator.    |

`Box` and `Padder` use `text-box-trim: trim-both` and
`text-box-edge: ex alphabetic` where the browser supports them, keeping text
edges aligned to the x-height and alphabetic baseline. Unsupported browsers
retain normal text layout. Trimming does not remove child margins or change a
nested heading's own line-box rules.
For nested text, set the same properties on its text container. See the
[CSS text-box-edge reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-box-edge)
for browser compatibility and alternative metrics such as `ex alphabetic`.

## Styles and themes

Import styles explicitly so applications control their CSS footprint:

```tsx
// React component styles and the default light/dark theme
import 'baseline-kit/styles'
import 'baseline-kit/theme'

// Or one combined file
import 'baseline-kit/styles/full'

// Guide-only styles
import 'baseline-kit/styles/guide'

// Optional reset
import 'baseline-kit/reset'
```

The built-in theme follows `prefers-color-scheme`. For a fixed theme, import
`baseline-kit/theme/default` or `baseline-kit/theme/dark`. For a custom theme,
copy the token template from `baseline-kit/theme/tokens` and define the CSS
variables your application needs.

Use `Config` for scoped overrides:

```tsx
<Config
  base={8}
  baseline={{
    colors: {
      line: 'rgba(255, 0, 0, 0.1)',
      flat: 'rgba(255, 0, 0, 0.05)',
    },
  }}
>
  {children}
</Config>
```

Theme variables are grouped by component:

| Component | Variable prefix         |
| --------- | ----------------------- |
| Baseline  | `--bk-baseline-color-*` |
| Guide     | `--bk-guide-color-*`    |
| Box       | `--bk-box-color-*`      |
| Spacer    | `--bk-spacer-color-*`   |
| Padder    | `--bk-padder-color-*`   |

See the [token template](https://github.com/dnvt/baseline-kit/blob/main/packages/react/src/components/styles/theme/tokens.css)
for the complete list.

## Remix 3 UI runtime

For Node SSR, use **`baseline-kit/remix/server`**, not `remix/ui/server`.
The pinned Remix RC loses provider context while serializing component-valued
children. This server entry corrects that traversal in an isolated renderer,
preserving nested `Config` scopes even when app or library entries hydrate late.
It does not change files in `node_modules` or install process-wide module hooks.

This is a Node-only compatibility entry, not an edge/browser renderer. It loads
the installed `@remix-run/ui@0.9.0` server implementation and verifies its exact
SHA-256 before applying the correction in memory. Keep the installed Remix
runtime files available in production; do not use a standalone bundle that
omits them. Modified or upgraded implementations fail with an explicit error
until compatibility is revalidated. Import `ImportMap` from this same entry if
used; `Frame` and client components still come from `remix/ui`.

```tsx
import { renderToStream, ImportMap } from 'baseline-kit/remix/server'

// If app contains an ImportMap component, use the export above.
const stream = renderToStream(app, { resolveClientEntry })
return new Response(stream, { headers: { 'Content-Type': 'text/html' } })
```

The React-free adapter uses `remix/ui` and does not import React or React DOM:

```shell
npm install baseline-kit remix@3.0.0-rc.2
```

```tsx
import 'baseline-kit/styles/remix'
import { Baseline, Box, Config, Guide, Spacer } from 'baseline-kit/remix'
import { jsx } from 'remix/ui/jsx-runtime'

export function App() {
  return jsx(Config, {
    base: 8,
    baseline: { debugging: 'visible' },
    children: [
      jsx(Baseline, { height: '100vh' }),
      jsx(Guide, { variant: 'fixed', columns: 12 }),
      jsx(Box, { children: 'Native Remix content' }),
      jsx(Spacer, { height: 16, variant: 'flat' }),
    ],
  })
}
```

The `resolveClientEntry` callback needs an app-owned mapping from each entry to a **browser-served
JavaScript asset**. A server filesystem URL or bare npm specifier is not a
browser asset. The mapping must handle the app's own client entries as well.
See the runnable [server resolver](https://github.com/dnvt/baseline-kit/blob/main/tests/browser/remix-ssr.ts)
and [asset-serving fixture](https://github.com/dnvt/baseline-kit/blob/main/tests/browser/vite.config.ts).

Once the server supplies public URLs, load the actual module and named export:

```tsx
import { run } from 'remix/ui'
run({
  loadModule: async (moduleUrl, exportName) => {
    const module = await import(
      /* @vite-ignore */ new URL(moduleUrl, document.baseURI).href
    )
    return module[exportName]
  },
})
```

Callbacks such as `indicatorNode` must be created inside the hydrated module;
functions cannot cross an SSR client-entry boundary. Keep `Config` and its
consumers within an app-owned hydrated component for interactive config updates.
This adapter is separate from React-based Remix/React Router applications,
which use the regular React entry.

In a Vite-based React application with a `links()` function, import the CSS as a
URL; a bare package specifier in `href` will not resolve:

```tsx
import stylesheetUrl from 'baseline-kit/styles?url'

export const links = () => [{ rel: 'stylesheet', href: stylesheetUrl }]
```

See [Vite's explicit URL imports](https://vite.dev/guide/assets.html#explicit-url-imports).

## Server-side rendering

React Baseline/Guide begin with a hidden fallback, then measure and paint after
hydration. Native Remix uses client-entry SSR and hydration through the resolver
above. `ssrMode` on Baseline/Guide **keeps the hidden fallback permanently** while
true: it disables client measurement and rows/columns. Leave it false (the
default) for visible, interactive overlays:

```tsx
<Baseline height="100vh" ssrMode debugging="visible" />
```

## Development

```shell
git clone https://github.com/dnvt/baseline-kit.git
cd baseline-kit
bun install --frozen-lockfile

bun run typecheck
bun run lint:check
bun run test:unit
bun run build
bun run test:integration:remix
```

Run the Chromium and WebKit browser regressions locally with:

```shell
bun run test:browser -- --project=chromium --project=webkit
```

The release workflow runs the complete browser matrix, builds the package, and
publishes through Changesets after the verification gates pass.

## Contributing

See [CONTRIBUTING.md](https://github.com/dnvt/baseline-kit/blob/main/CONTRIBUTING.md) for contribution and pull-request
guidelines.

## License

MIT © [François Denavaut](https://github.com/dnvt)
