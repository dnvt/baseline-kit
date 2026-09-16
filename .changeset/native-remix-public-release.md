---
'baseline-kit': minor
---

Validation complete: the delayed-entry nested Config regressions and complete
browser matrix pass in the packed consumer. Version and publish this candidate
through the normal Changesets workflow after review.

Use the new Node-only `baseline-kit/remix/server` renderer for SSR with the
pinned Remix RC. It preserves nested provider context during serialization,
validates the upstream source digest, and leaves installed dependencies unchanged.

Add a React-free `baseline-kit/remix` adapter and `baseline-kit/styles/remix`, tested with Remix 3.0.0-rc.2. React applications keep using the root or guide entry without installing Remix.

Fix browser-resolved Baseline sizing, scoped Config color propagation, default paint without a theme, shared React Config across root/guide imports, and observer lifecycle regressions. Box and Padder now apply CSS text-box trimming using x-height (`ex`) and alphabetic baseline metrics; unsupported browsers retain normal line boxes.

Update the public installation, SSR, asset loading, spacing, browser support, and contributor documentation. Keep internal workspaces private, include the changelog in npm packages, and verify browser behavior using the packed native adapter before release.
