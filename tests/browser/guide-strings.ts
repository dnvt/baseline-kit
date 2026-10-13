/**
 * The `?guides` fixture (slice 3b), shared by the React and Remix entries:
 * Guides under an 8px base in 300px-wide boxes, tagged by `data-guide-case`:
 * with `gap="1rem"`, fixed (4 x 40px columns), line, and auto (40px columns,
 * so the column count depends on the gap); and auto with a 2.5rem column
 * width and a 16px gap (`autorem`).
 */
export const GUIDE_CASES = [
  {
    id: 'fixed',
    props: { variant: 'fixed', columns: 4, columnWidth: 40, gap: '1rem' },
  },
  { id: 'line', props: { variant: 'line', gap: '1rem' } },
  { id: 'auto', props: { variant: 'auto', columnWidth: 40, gap: '1rem' } },
  // A rem column width with a px gap: the count follows the root too.
  {
    id: 'autorem',
    props: { variant: 'auto', columnWidth: '2.5rem', gap: 16 },
  },
] as const

export const GUIDE_BOX = {
  position: 'relative',
  width: '300px',
  height: '40px',
}
