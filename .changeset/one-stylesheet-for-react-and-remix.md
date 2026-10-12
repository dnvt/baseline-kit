---
'baseline-kit': major
---

One stylesheet and one set of rules for React and Remix 3.

Breaking changes:

- React components now render the same global `bk-*` classes as the Remix entry. The hashed CSS-module class names are gone.
- `baseline-kit/styles` is the only component stylesheet. Removed entries: `baseline-kit/styles/remix` (use `baseline-kit/styles`), `baseline-kit/styles/full` and `baseline-kit/full` (import `baseline-kit/styles` and `baseline-kit/theme`), `baseline-kit/styles/reset` (use `baseline-kit/reset`), `baseline-kit/theme/tokens` (copy the template from the repository), and the raw `baseline-kit/dist/*.css` paths.
- Removed the `baseline-kit/guide` and `baseline-kit/styles/guide` entries. Import `Guide` from `baseline-kit` and use `baseline-kit/styles`.
- Remix `Box` takes `htmlFor` instead of `for` with `as="label"`, matching React.
- Remix `Padder` now defaults to `fit-content` width like React. Previously it stretched, and `width="fit-content"` had no effect.
- Removed undocumented exports: `isSSR` and `safeClientValue` from `baseline-kit`, and `GRID_ALIGNMENTS`, `GridAlignment`, `PADD_VARIANTS`, `PaddedVariant`, and `RELATIVE_UNITS` from `baseline-kit/core`.
- Removed the undocumented `--bkbx-initial-is` first-paint hook from the Remix `Box`.
- Removed `createStyleOverride` and `StyleOverrideParams` from `baseline-kit/core`.
- The core descriptors now return host styles without the values the stylesheet already sets, and their `classTokens` include the variant (and `compact` for Baseline). `createBaselineDescriptor` takes `domDiagnostics`, `className`, and `style`, and returns `compactPaint`. `createBoxDescriptor` takes `padding` and `paddingColor`, and returns `spacingStyle` and `paddingDebugStyle`.
- React and Remix component props now come from the same core option types. React `width`, `height`, `columnWidth`, and `maxWidth` are typed `number | string`. React `Guide` no longer accepts `base`, and React `Guide` and `Spacer` forward only global attributes (`id`, `title`, `role`, `aria-*`, `data-*`, and similar) to the DOM, like the other components.
- React content now trims the text box of the content wrapper's direct children, as Remix already did. Paragraphs and headings placed directly inside `Box` or `Padder` may measure shorter.

Features:

- React `Box` supports `as` and `htmlFor` for semantic hosts, like Remix.
- React `Box` paints the shaded padding bands in visible debug mode, like Remix.
- `baseline-kit/core` exports the shared component option types (`BaselineOptions`, `BoxOptions`, `GuideOptions`, `PadderOptions`, `SpacerOptions`, `BoxElement`), the server-fallback helpers `createBaselineFallbackStyle` and `createGuideFallbackStyle`, and `isOnBaseline`, `getBaselineRemainder`, and `SNAP_TOLERANCE`.
- The `remix` peer range is now `^3.0.0`.

Fixes:

- Snapping treats heights within 1/64px of a grid line as aligned, so browser zoom and display scaling no longer add an extra base row.
- React and Remix measure heights with fractional precision, so trimmed text snaps exactly onto the grid instead of drifting by up to half a pixel per Box.
- A semantic `Box` with a percentage `width` or `height` no longer applies it twice.
- A semantic `Box` snaps its whole element, including its own border and padding.
- `baseline-kit/remix/server` checks the code it patches instead of the whole file's hash, so a patch release of `@remix-run/component` no longer stops it from loading.
- `baseline-kit/theme/dark` includes the dark spacer colors. `baseline-kit/theme` is now generated from the light and dark themes.
- Remix `.bk-flat` no longer paints flat Baseline hosts with the Spacer color.
- Remix components release ResizeObservers of client entries nested inside a removed entry, which Remix does not always dispose.
- Remix client entries no longer serialize the default config into their props.
- Remix `Padder` measures fractional heights like `Box`.
