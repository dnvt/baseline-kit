import { CSSProperties } from 'react'

/**
 * Combines class names, filtering out falsy values.
 * Useful for conditionally applying class names in React components.
 *
 * @param classes - An array of class names or falsy values (e.g., `null`, `undefined`, `false`).
 * @returns A single string of class names, separated by spaces.
 */
export const cx = (
  ...classes: Array<string | boolean | undefined | null>
): string => classes.filter(Boolean).join(' ').trim()

/**
 * Combines multiple style objects into one, ensuring type safety.
 * Useful for dynamically applying styles in React components.
 *
 * @param styles - An array of style objects or `undefined`.
 * @returns A single combined style object.
 */
export const cs = <T extends CSSProperties>(...styles: Array<T | undefined>): T =>
  Object.assign({}, ...styles.filter((style): style is T => style !== undefined))