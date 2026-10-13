/**
 * The `?remgrid` fixture, shared by the React and Remix entries: Boxes under
 * a `0.5rem` base (and a px twin as the control) holding `line-height:
 * 1.5rem` text with a zero-size marker after each word, whose top is that
 * line's baseline, and an off-grid trailer the Box must snap away. Margins
 * are zeroed so each Box starts where the previous one ends.
 */
export const REM_GRID_WORDS =
  'Sphinx of black quartz, judge my vow; the five boxing wizards jump quickly over the lazy dog.'.split(
    ' '
  )

export const REM_GRID_BOXES = [
  { variant: {}, size: 1, trailer: '0.3rem', snapping: 'clamp' },
  {
    variant: { className: 'rem-c' },
    size: 1.125,
    trailer: '5px',
    snapping: 'height',
  },
  {
    variant: { className: 'rem-c', debugging: 'none' },
    size: 0.875,
    trailer: '0.7rem',
    snapping: 'clamp',
  },
  { variant: { as: 'h3' }, size: 1, trailer: '13px', snapping: 'height' },
  { variant: {}, size: 1.25, trailer: '1.1rem', snapping: 'height' },
  {
    variant: { className: 'rem-c' },
    size: 1,
    trailer: '3px',
    snapping: 'clamp',
  },
] as const

export const REM_GRID_CSS = '[data-rem-grid] [data-rem] { margin: 0; }'

export const REM_GRID_SECTION = { width: '320px', fontFamily: 'serif' }

export const REM_GRID_MARK = {
  display: 'inline-block',
  width: '0',
  height: '0',
}

export const remGridText = (size: number) => ({
  display: 'block',
  fontSize: `${size}rem`,
  lineHeight: '1.5rem',
})
