/** Creates gap styles for the stack */
export const createStackGapStyles = (
  rowGap?: number,
  columnGap?: number,
  gap?: number,
): Record<string, number | undefined> => ({
  rowGap,
  columnGap,
  ...(gap !== undefined && { gap }),
});
