import { useMemo } from 'react'
import { CSSValue, MeasurementSystem } from '@utils'


export interface UseDimensionsOptions {
  /** The raw width to normalize. Could be a number (e.g. 20), a string with units (e.g. "2rem"), or special strings like "auto" or "100%". */
  width?: CSSValue
  /** The raw height to normalize. Could be a number (e.g. 20), a string with units (e.g. "2rem"), or special strings like "auto" or "100%". */
  height?: CSSValue
  /** Fallback numeric width to use when `width` is `undefined`. */
  defaultWidth?: number
  /** Fallback numeric height to use when `height` is `undefined`. */
  defaultHeight?: number
  /** The grid base (in px) for normalization. Defaults to 8. */
  base?: number
}

/**
 * - If `width` (or `height`) is undefined -> the CSS dimension becomes `"100%"`,
 *   while the numeric `normalizedWidth` (or `normalizedHeight`) uses `defaultWidth` (or `defaultHeight`).
 *
 * - If `width` (or `height`) is `"auto"` or `"100%"` -> the CSS dimension stays `"auto"`/`"100%"`,
 *   and its numeric value defaults to `base`.
 *
 * - If it's a plain number -> we normalize it to `[value]px` and return that numeric value as well.
 *
 * - If it's a string with units (e.g., `"24px"`, `"2rem"`) -> we normalize it to a numeric value but keep the original string for CSS usage.
 */
export function useNormalizedDimensions({
  width,
  height,
  defaultWidth = 0,
  defaultHeight = 0,
  base = 8,
}: UseDimensionsOptions) {
  return useMemo(() => {
    /**
     * Internal helper to produce:
     * - A final CSS dimension string (e.g. "100%", "auto", "32px", "2rem")
     * - The numeric dimension in px (normalized to the `base`) or a fallback.
     */
    function normalizeValue(
      val: CSSValue | undefined,
      fallback: number,
    ): { css: string; numeric: number } {
      // If completely undefined => "100%" in CSS, numeric fallback in px
      if (val == null) {
        const normalized = MeasurementSystem.normalizeDimension(undefined, fallback, { unit: base })
        return { css: '100%', numeric: normalized }
      }

      // If it's 'auto' or '100%' => keep that string, numeric defaults to `base`
      if (val === 'auto' || val === '100%') {
        return { css: val, numeric: base }
      }

      // If numeric => convert to px string and store the normalized number
      if (typeof val === 'number') {
        const normalized = MeasurementSystem.normalizeDimension(val, fallback, { unit: base })
        return { css: `${normalized}px`, numeric: normalized }
      }

      // If it's a string with units => keep the original for CSS, but also get a normalized number
      const normalized = MeasurementSystem.normalizeDimension(val, fallback, { unit: base })
      return { css: val, numeric: normalized }
    }

    const w = normalizeValue(width, defaultWidth)
    const h = normalizeValue(height, defaultHeight)

    return {
      /** The dimension strings for direct use in style props: */
      width: w.css,
      height: h.css,

      /** The numeric values in px (normalized to `base`). */
      normalizedWidth: w.numeric,
      normalizedHeight: h.numeric,

      /** A quick object to spread into style for dimension-based custom properties. */
      cssProps: {
        '--dimension-width': w.css,
        '--dimension-height': h.css,
      },

      /** The "dimensions" object that `useSpacerDimensions` used to provide. */
      dimensions: {
        width: w.css,
        height: h.css,
      },
    }
  }, [width, height, defaultWidth, defaultHeight, base])
}