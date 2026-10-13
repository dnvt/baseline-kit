/**
 * The `?guides` fixture (slice 3b), shared by the React and Remix entries:
 * Guides with `gap="1rem"` under an 8px base in 300px-wide boxes, tagged by
 * `data-guide-case`: fixed (4 x 40px columns), line, and auto (40px columns,
 * so the column count depends on the gap).
 */
export const GUIDE_CASES = [
  { id: 'fixed', props: { variant: 'fixed', columns: 4, columnWidth: 40 } },
  { id: 'line', props: { variant: 'line' } },
  { id: 'auto', props: { variant: 'auto', columnWidth: 40 } },
] as const

export const GUIDE_BOX = {
  position: 'relative',
  width: '300px',
  height: '40px',
}
