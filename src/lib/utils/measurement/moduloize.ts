import { MeasurementSystem, CSSValue } from '@utils'

/**
 * Interprets the given CSSValue (number or px/rem string),
 * converts it to a numeric pixel count, and then returns
 * `(pixelCount % base)` + 'px'.
 *
 * If the user passes a big number like 14,
 * with base = 8, we end up 14 % 8 = 6 => "6px".
 *
 * If they pass 20px, that becomes numeric 20 => 20 % 8 = 4 => "4px"
 *
 * If they pass a relative unit like 1rem,
 * MeasurementSystem should convert to px (16?),
 * then do 16 % 8 = 0 => "0px"
 */
export function moduloize(
  value: CSSValue | undefined,
  base: number,
  { round = false } = {},
): string {

  if (value === 'auto') return '0px'

  const px = MeasurementSystem.normalize((value) ?? 0, {
    unit: 1,
    round,
    suppressWarnings: true,
  })

  const remainderRaw = px % base
  const remainder = Number(remainderRaw.toFixed(2))
  return `${remainder}px`
}