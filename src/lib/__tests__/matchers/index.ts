interface CustomMatcherResult {
  pass: boolean;
  message: () => string;
}

interface MatcherContext {
  isNot?: boolean;
}

export const customMatchers = {
  toHaveGridStyle(
    this: MatcherContext,
    received: HTMLElement,
    expected: Record<string, string | number>,
  ): CustomMatcherResult {
    const style = received.style
    const actualStyles: Record<string, string> = {}
    const failedMatches: Record<string, { expected: string; actual: string }> = {}
    let pass = true

    Object.entries(expected).forEach(([prop, expectedValue]) => {
      const actualValue = style.getPropertyValue(prop)
      actualStyles[prop] = actualValue

      const expectedStr = expectedValue.toString()
      const normalizedActual = normalizeStyleValue(actualValue)
      const normalizedExpected = normalizeStyleValue(expectedStr)

      if (normalizedActual !== normalizedExpected) {
        pass = false
        failedMatches[prop] = {
          expected: expectedStr,
          actual: actualValue,
        }
      }
    })

    return {
      pass,
      message: () => {
        const diffMessage = Object.entries(failedMatches)
          .map(([prop, { expected, actual }]) =>
            `\n  ${prop}:\n    Expected: "${expected}"\n    Received: "${actual}"`,
          )
          .join('\n')

        return pass
          ? `Expected element not to have styles:\n${JSON.stringify(expected, null, 2)}`
          : `Expected element to have styles:${diffMessage}`
      },
    }
  },

  toHaveEquivalentValue(
    this: MatcherContext,
    received: string | number,
    expected: string | number,
  ): CustomMatcherResult {
    const normalizedReceived = normalizeStyleValue(received.toString())
    const normalizedExpected = normalizeStyleValue(expected.toString())

    return {
      pass: normalizedReceived === normalizedExpected,
      message: () =>
        `Expected ${received} ${this.isNot ? 'not ' : ''}to be equivalent to ${expected}`,
    }
  },
}

// Helper function to normalize CSS values for comparison
function normalizeStyleValue(value: string): string {
  // Remove whitespace
  value = value.trim()

  // Convert numbers to pixel values
  if (/^\d+$/.test(value)) {
    return `${value}px`
  }

  // Handle calc expressions
  if (value.startsWith('calc(')) {
    // Normalize calc spacing
    return value.replace(/\s+/g, ' ')
  }

  return value
}
