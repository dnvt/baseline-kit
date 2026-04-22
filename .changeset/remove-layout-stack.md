---
'baseline-kit': major
---

Remove `Layout` and `Stack` components

Both `Layout` (CSS grid wrapper) and `Stack` (flexbox wrapper) have been
removed. Baseline Kit now focuses purely on its core mission: baseline-grid
visualization (`Baseline`, `Guide`) and spacing primitives (`Box`, `Padder`,
`Spacer`, `Config`). The library does not need to ship its own layout
primitives — modern CSS and component libraries already cover that need
better than thin wrappers can.

**Migration**

Replace `<Layout>` with a plain `<div>` (or your design system's grid
wrapper):

```tsx
// Before
<Layout columns={3} gap={16}>{children}</Layout>

// After
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
  {children}
</div>
```

Replace `<Stack>` with a flex container:

```tsx
// Before
<Stack direction="column" gap={8}>{children}</Stack>

// After
<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
  {children}
</div>
```

The following exports have been removed from `baseline-kit`:

- Components: `Layout`, `Stack`
- Types: `LayoutProps`, `StackProps`
- Pure descriptors (from `@baseline-kit/core`): `createLayoutDescriptor`,
  `createStackDescriptor`, `getGridTemplate`, `LayoutDescriptor`,
  `LayoutDescriptorParams`, `StackDescriptor`, `StackDescriptorParams`,
  `DIRECTION_AXIS`
- CSS variables: `--bkly-*`, `--bksk-*`, and their themed
  `--bk-{layout,stack}-color-*` counterparts
