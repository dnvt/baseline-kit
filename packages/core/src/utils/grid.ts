export const createGridSpanStyles = (
  span?: number,
  colSpan?: number,
  rowSpan?: number
): Record<string, string> => {
  const gridStyles: Record<string, string> = {}

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
