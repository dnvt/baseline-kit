---
'baseline-kit': minor
---

Box, and a Padder with a content host, trim their text to `--bk-text-box-edge`, which defaults to `ex alphabetic` as before. Set it on a Box or any ancestor (`--bk-text-box-edge: cap alphabetic`) to trim at cap height: the host, its grid, the Padder, the content and the content's direct children all follow it, so one declaration replaces overriding five rules. Nothing changes where it isn't set.

- Nested Boxes take the edge of the nearest ancestor that sets it; `--bk-text-box-edge: initial` on a Box brings back the default.
- Give the full value, such as `cap alphabetic`: a lone `cap` means `cap text`, and an invalid value doesn't fall back to the default but inherits the edge from outside the Box.
- A Padder with `debugging="none"` used directly trims nothing, as before.
