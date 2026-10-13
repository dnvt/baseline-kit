---
'baseline-kit': patch
---

Follow-ups to 7.1.0's live unit strings:

- A `var()` fallback must fit where the `var()` is: a Spacer height of `var(--gap, 2)` now keeps the base fallback instead of collapsing to 0px when `--gap` is unset, while `calc(var(--n, 2) * 1rem)` stays live.
- Spacer heights also follow `round()`, `mod()` and `rem()` inside math (same browser support as `round()`), and custom property names with non-ASCII characters (`var(--größe)`).
- Unit conversion reads only its own unit names: `'10constructor'` no longer converts to NaN.
- README: a string width goes to CSS as written, so a browser that lacks one of its units keeps the Spacer's default width.
