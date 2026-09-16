# Contributing to Baseline Kit

Contributions are welcome through pull requests. Please keep changes focused,
add regression coverage for behavior changes, and update the README or
CHANGELOG when the public API or consumer workflow changes.

## Local development

Requirements: Node.js 24.15+, Bun 1.3.12, and a modern browser. Install the
repository dependencies with the lockfile:

```shell
bun install --frozen-lockfile
```

Useful commands:

```shell
bun run typecheck
bun run lint:check
bun run test:unit
bunx playwright install chromium firefox webkit
bun run test:browser
bun run build
bun run test:integration:remix
```

`bun run lint` applies ESLint fixes. Use `bun run lint:check` in CI and before
opening a pull request. `bun run test` starts Vitest in watch mode;
`bun run test:unit` is the deterministic one-shot suite.

`bun run dev` serves the regression fixtures: `/` for React and `/remix.html`
for native Remix. They include deliberately tall overlays to test scrolling;
they are not a styled product demo. Set `BASELINE_BROWSER_PORT` to isolate a
browser test server when another test session is running.

### Firefox on hosts that cannot launch its native binary

Use a local Linux browser server if macOS blocks the Firefox profile. This does
not change OS security settings or skip Firefox assertions. In one terminal:

```shell
docker run --rm --init --name baseline-kit-firefox --user pwuser \
  --workdir /home/pwuser -p 127.0.0.1:33001:3000 \
  mcr.microsoft.com/playwright:v1.63.0-noble \
  sh -c 'npx -y playwright@1.63.0 run-server --port 3000 --host 0.0.0.0'
```

In another terminal:

```shell
BASELINE_FIREFOX_WS_ENDPOINT=ws://127.0.0.1:33001/ bun run verify:integration
```

Only Firefox uses this endpoint; Chromium/WebKit remain local. The test runner
forwards loopback traffic to its fixture server. Keep the server local and the
Playwright versions matched. Stop the container when finished. See the
[Playwright Docker guide](https://playwright.dev/docs/docker#remote-connection).
Packed integration also runs all three engines.

## Project structure

Baseline Kit is a workspace repository. The published package is the root
`baseline-kit` package; the inner packages provide private implementation layers
and must not be published independently.

```text
packages/
├── core/src/       # Pure types, config, validation, descriptors, and math
├── dom/src/        # Browser observers, measurement, timing, and SSR helpers
├── react/src/      # React 19 components, hooks, and CSS
└── remix/src/      # React-free Remix 3 UI adapter and CSS
```

Tests live in `tests/` and cover the core, DOM, React, Remix, build artifacts,
and packed-consumer integration paths.

## Pull requests

1. Branch from `main`.
2. Keep the public API and generated artifacts consistent.
3. Add or update tests for behavior changes.
4. Update documentation and add a Changeset for publishable changes.
5. Run the focused checks above, then `bun run verify:integration` for a
   release-bound change.

## Release notes

Create a Changeset for user-facing changes:

```shell
bun run changeset
```

The release workflow validates the package, creates the version/changelog pull
request, and publishes through Changesets after that pull request is merged.

## License

By contributing, you agree that your work is provided under the MIT License.
