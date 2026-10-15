---
'baseline-kit': patch
---

A `Padder` used directly with `debugging="none"` (no spacers, no content host) now lands its last baseline where Chromium does in Firefox and WebKit too, in a flex or grid row aligned on `last baseline` (tested with Playwright's Chromium 153, Firefox 155 and WebKit 26.6, React and Remix). 7.2.0 left it with three explicit rows that its children rarely fill, and those engines read the empty last one.

- It now makes rows only as its auto-placed children fill them, start-aligned, with no change to its DOM or classes. Without a caller `gap`, its size and its children's positions match 7.2.0's for one and two children at auto and fixed heights.
- In a Padder taller than its content, with more than three direct children, the second row of children keeps its content height; 7.2.0 stretched it to fill the Padder.
- `row-gap` (or `gap`) on such a Padder adds only the gaps between its filled rows; 7.2.0 also added the two gaps around its empty rows, so the Padder is shorter and snaps from its new height.
- CSS that places its children by row line (`grid-row: 2`, `1 / -1`), sets `grid-auto-rows`, or sets only auto rows in a taller Padder changes meaning the same way: there is no second, stretching row, and with no explicit rows `-1` is line 1, so `1 / -1` spans a single row.
- Children still sit side by side in its three columns, as in 7.2.0; aligned on `last baseline`, the last child in the last row sets the baseline, as observed in all three engines in a probe (not in the test matrix).
