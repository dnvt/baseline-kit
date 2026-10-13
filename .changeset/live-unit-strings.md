---
'baseline-kit': minor
---

`Spacer` string sizes follow the page, in React and Remix. A CSS length height (`'3rem'`, `'10vh'`, `'50%'`, `'calc(100% - 23px)'`) still rounds to the base, now in CSS with `round()`, so it follows the root font size, the viewport and its container as they change; under a rem base it rounds to the rem value. A CSS length width renders as written.

- 7.0 resolved size strings against a fixed 16px root and a 1920x1080 viewport. Now they resolve as CSS does: `%` heights (were 0px), `calc()` (was the base), `vh`/`vw` (were fixed), and `em`, which now means the Spacer's own font size (was a fixed 16px). `width="100%"` fills its container (was 0px).
- Strings that aren't CSS lengths (`'auto'`, `'24'`, keywords, units newer than `round()` such as `lh` or `cqw`, malformed math such as `'calc(100%-23px)'`) keep 7.0's fallback to the base. Browsers without CSS `round()` (before Chrome 125, Firefox 118 and Safari 15.4) keep the px value for string heights: 7.0's value, except for the unit spellings conversion now reads (below).
- An indicator for a string size shows the rendered size, measured after mount.
- `SpacerDescriptor.style` carries a string height's live value in `--bksp-hl` (`--bksp-h` and `data-height` keep the px value) and a string width as written in `--bksp-w`. The core exports `isCSSLength`, and `SpacerDescriptorParams` gains an optional `baseRem`.
- `Guide` accepts a string `gap` (`'1rem'`, `'2%'`). It resolves when the Guide renders (on mount, when its size changes, and for a rem `gap` or `columnWidth`, when the root font size changes) against the root font size, the viewport and the Guide's own width, then rounds to the base, so an `auto` Guide's column elements keep matching its CSS columns. It reads px, rem, `%`, viewport units and absolute units; `em` resolves against 16px and anything else, `calc()` included, falls back to the base. In 7.0 React drew no gap for a string, and Remix resolved a rem gap against a fixed 16px root and a `%` gap against 0px.
- `%` gaps (every variant) and an `auto` Guide's `%` column width resolve against the Guide's width (7.0: 0px, so an `auto` Guide drew one column element).
- Unit conversion (`convertValue`) reads units case-insensitively and every viewport unit form (`vi`, `vb`, `svh`, `dvmin`, ...). Values that used to be unreadable now convert: `convertValue('1PX')` is 1 (was null), a Spacer's px fallback for `'10dvh'` or `'2REM'` is the converted size instead of the base, and the same spellings now convert in an `auto` Guide's `columnWidth` and in a Baseline's size before its first measurement.
- `GuideOptions.gap` widens to `number | string`; the core exports `isRootRelative`.
