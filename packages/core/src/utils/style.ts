/** Drop style entries that already match the stylesheet defaults. */
export function compactStyle(
  style: Record<string, string>,
  defaults: Record<string, string>
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(style).filter(
      ([property, value]) => defaults[property] !== value
    )
  )
}

const DOM_ATTRIBUTE_NAMES = new Set([
  'id',
  'title',
  'role',
  'tabIndex',
  'lang',
  'dir',
  'hidden',
])

/** Keep only the global attributes components forward to their host. */
export function getDOMAttributes(
  props: Record<string, unknown>
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(props).filter(
      ([name]) =>
        name.startsWith('data-') ||
        name.startsWith('aria-') ||
        DOM_ATTRIBUTE_NAMES.has(name)
    )
  )
}
