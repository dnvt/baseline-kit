/** Creates default stack styles */
export const createDefaultStackStyles = (colors: Record<string, string>) => ({
  '--bkkw': 'auto',
  '--bkkh': 'auto',
  '--bkkcl': colors.line,
  '--bkkcf': colors.flat,
  '--bkkci': colors.text,
});

/** Determines style overrides */
export const getStackStyleOverride = (
  key: string,
  value: string,
  defaultStyles: Record<string, string>,
): Record<string, string | number> => {
  if (key === '--bkkw' && value === 'auto') return {};
  if (key === '--bkkh' && value === 'auto') return {};
  return value !== defaultStyles[key] ? { [key]: value } : {};
};
