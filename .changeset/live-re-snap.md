---
'baseline-kit': minor
---

`Box` and `Padder` follow their content: they re-snap whenever their content height changes (a web font loading, a font or size change, text rewrapping at a new width, a new root font size), in React and Remix. In 7.0 they followed content changes only for two seconds after a snap, after a web font loaded, or when the tab became visible, so a later change left them off the grid until their props changed or they remounted.

- Snapping uses the padding the DOM actually renders, so a CSS transition on a Box's padding no longer sets off repeated snaps.
- Snapped block padding is kept to 1/1024px, so padding read back from the DOM (computed styles round it to six significant digits) no longer leaves a Box a layout unit short of the grid in Chromium and WebKit.
- A Box whose height is held from outside (`min-height`, a stretched flex or grid item) settles within a few updates instead of alternating between two heights.
- A content-driven Box updates at most once per change (a Padder around a Box once more, after it) and none update once sizes stop changing. It ends where a fresh load would, unless its content flickered in step with its corrections, which can leave it one base row taller (still on the grid) until its height next changes. Content that animates its height is followed frame by frame.
- A Padder that draws no spacers (`debugging="none"`) carries a `bk-pad-plain` class, so its padding can be read back while it animates.
- In browsers without `currentCSSZoom` (WebKit on Linux), CSS `zoom` on an ancestor is now measured by multiplying each ancestor's zoom. Boxes there snapped to the zoomed grid instead of the page's.
- `SNAP_SETTLE_MS` is deprecated and no longer used.
- `SnapMeasurement.settling` is optional and defaults to `true`; passing `false` still keeps the current snap. `SnapState` gains optional `measured` and `earlier` fields (type `SnapMeasured`).
