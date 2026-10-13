---
'baseline-kit': minor
---

`Spacer` string sizes follow the page, in React and Remix. A CSS length height (`'3rem'`, `'10vh'`, `'50%'`, `'calc(100% - 23px)'`) still rounds to the base, now in CSS with `round()`, so it follows the root font size, the viewport and its container as they change; under a rem base it rounds to the rem value. A CSS length width renders as written.

- 7.0 resolved size strings against a fixed 16px root and a 1920x1080 viewport. Now they resolve as CSS does: `%` heights (were 0px), `calc()` (was the base), `vh`/`vw` (were fixed), and `em`, which now means the Spacer's own font size (was a fixed 16px). `width="100%"` fills its container (was 0px).
- Strings that aren't CSS lengths (`'auto'`, `'24'`, keywords) keep 7.0's fallback to the base. Browsers without CSS `round()` keep 7.0's px values for string heights.
- An indicator for a string size shows the rendered size, measured after mount.
- `SpacerDescriptor.style` carries a string height's live value in `--bksp-hl`; `--bksp-h` and `data-height` keep the px value. The core exports `isCSSLength`, and `SpacerDescriptorParams` gains an optional `baseRem`.
- `Guide` accepts a string `gap` (`'1rem'`, `'2%'`), resolved against the live root font size, viewport and the Guide's own width, then rounded to the base. A Guide whose `gap` or `columnWidth` is in rem re-renders when the root font size changes, so its column elements keep matching the CSS columns. In 7.0 React drew no gap for a string and Remix resolved it against a fixed 16px root.
- An `auto` Guide's `%` column width and gap resolve against the Guide's width (7.0: 0px, so one column element).
- `GuideOptions.gap` widens to `number | string`; the core exports `isRootRelative`.
