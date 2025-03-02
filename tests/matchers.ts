const normalizeStyleValue = (value: string): string => {
  const trimmed = value.trim()
  if (/^\d+$/.test(trimmed)) return `${trimmed}px`
  if (trimmed.startsWith('calc(')) return trimmed.replace(/\s+/g, ' ')
  return trimmed
}

export const customMatchers = {
  toHaveGridStyle(received: HTMLElement, expectedStyles: Record<string, string | number>) {
    const failed = Object.entries(expectedStyles).filter(([prop, expected]) => {
      const actual = normalizeStyleValue(received.style.getPropertyValue(prop))
      return actual !== normalizeStyleValue(expected.toString())
    })
    const pass = failed.length === 0
    return {
      pass,
      message: () =>
        pass
          ? `Expected element not to have grid styles ${JSON.stringify(expectedStyles)}`
          : `Expected element to have grid styles, but differences were found: ${failed
            .map(([prop, expected]) => `${prop}: Expected ${expected}, got ${received.style.getPropertyValue(prop)}`)
            .join(', ')}`,
    }
  },
  toHaveEquivalentValue(received: string | number, expected: string | number) {
    const normalizedReceived = normalizeStyleValue(received.toString())
    const normalizedExpected = normalizeStyleValue(expected.toString())
    const pass = normalizedReceived === normalizedExpected
    return {
      pass,
      message: () => `Expected ${received} ${this.isNot ? 'not ' : ''}to equal ${expected}`,
    }
  },
}

expect.extend(customMatchers)