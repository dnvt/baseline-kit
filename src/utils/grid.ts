/**
 * @file grid.ts
 * @description Grid layout utilities
 * @module utils
 */

import * as React from 'react'

/**
 * Creates grid span styles based on span props.
 * Handles both combined span and individual col/row span values.
 *
 * @param span - Optional equal span for both rows and columns
 * @param colSpan - Optional column span value
 * @param rowSpan - Optional row span value 
 * @returns CSS properties object with grid span values
 * 
 * @example
 * ```ts
 * createGridSpanStyles(2) // => { gridColumn: "span 2", gridRow: "span 2" }
 * createGridSpanStyles(undefined, 3, 2) // => { gridColumn: "span 3", gridRow: "span 2" }
 * ```
 */
export const createGridSpanStyles = (
  span?: number,
  colSpan?: number,
  rowSpan?: number
): React.CSSProperties => {
  const gridStyles: React.CSSProperties = {}
  
  if (span !== undefined) {
    gridStyles.gridColumn = `span ${span}`
    gridStyles.gridRow = `span ${span}`
  } else {
    if (colSpan !== undefined) {
      gridStyles.gridColumn = `span ${colSpan}`
    }
    if (rowSpan !== undefined) {
      gridStyles.gridRow = `span ${rowSpan}`
    }
  }
  
  return gridStyles
} 