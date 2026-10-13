---
'baseline-kit': minor
---

`Config` accepts a base in rem, such as `base="0.5rem"`, so the grid follows the root font size, in React and Remix. When the root font size changes (a stylesheet, the reader's default font size), the base re-resolves and every `Box` and `Padder` re-snaps; text with a `line-height` in rem that is a multiple of the base keeps its lines a whole number of rows apart. The server renders a rem base at 16px and the client hydrates that HTML without a mismatch, then switches to the live size. One hidden `1rem` element under `<html>`, there only while a rem base is in use, watches the root font size.

- `ConfigSchema.base` stays the resolved number in px; `ConfigSchema` gains an optional `baseRem` with the rem value.
- `mergeConfig` accepts `rootFontSize` (default 16) to resolve a rem base, and warns once about a base that is neither a number nor a positive rem value. The core exports `BaseValue`, `DEFAULT_ROOT_FONT_SIZE`, `parseRemBase` and `resolveConfigBase`.
- Component `base` props (`Baseline`, `Spacer`) still take numbers.
- A root font size change can update a Box twice, once for the new base and once for the reflowed text; on a 100-Box page it reaches the grid in no more frames than with a px base.
