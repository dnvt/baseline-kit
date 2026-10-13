/**
 * The `?spacers` fixture (slice 3a), shared by the React and Remix entries,
 * tagged by `data-spacer`. Under an 8px base (`data-spacer-grid="px"`): string
 * heights the browser resolves live, rounded to the base in CSS, and strings
 * that keep 7.0's base fallback; `%` and `calc()` heights in 100px parents; a
 * `100%` width in a 300px flex row and a numeric width; a 2ch-wide probe for
 * the `ch` case. Under a 0.5rem base (`data-spacer-grid="rem"`): one rem
 * height. A visible 2rem Spacer shows its size through an indicator.
 */
export const SPACER_HEIGHTS = [
  { id: 'rem13', height: '1.3rem' },
  { id: 'vh10', height: '10vh' },
  { id: 'ch2', height: '2ch' },
  { id: 'auto', height: 'auto' },
  { id: 'unitless', height: '24' },
  { id: 'keyword', height: 'min-content' },
  { id: 'oops', height: 'calc(oops)' },
  // 7.1.1: var() products, stepped functions, and an unfit var() fallback.
  { id: 'varn', height: 'calc(var(--bk-test-n) * 1rem)' },
  { id: 'stepped', height: 'round(up, 1.3rem, 8px)' },
  { id: 'varfallback', height: 'var(--bk-test-unset, 2)' },
] as const

export const SPACER_IN_PARENT = [
  { id: 'pct50', height: '50%' },
  { id: 'calc', height: 'calc(100% - 23px)' },
] as const

// --bk-test-n feeds the var() product case.
export const SPACER_SECTION = {
  width: '320px',
  fontFamily: 'serif',
  '--bk-test-n': '2',
}
export const SPACER_PARENT = { height: '100px' }
export const SPACER_ROW = { display: 'flex', width: '300px' }
export const SPACER_CH_PROBE = { display: 'inline-block', width: '2ch' }
