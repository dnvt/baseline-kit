export const customMatchers = {
  toHaveGridStyle(received: HTMLElement, expected: Record<string, string | number>) {
    const style = received.style
    const actualStyles: Record<string, string> = {}
    const failedMatches: Record<string, { expected: string; actual: string }> = {}
    let pass = true

    Object.entries(expected).forEach(([prop, expectedValue]) => {
      const actualValue = style.getPropertyValue(prop)
      actualStyles[prop] = actualValue

      const expectedStr = expectedValue.toString()

      if (actualValue !== expectedStr) {
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

  toHavePartialClassName(received: HTMLElement, expected: string) {
    const classList = Array.from(received.classList)
    const hasPartialMatch = classList.some(className => className.includes(expected))

    return {
      pass: hasPartialMatch,
      message: () => {
        const classListStr = classList.join(', ')
        return hasPartialMatch
          ? `Expected element not to have class containing "${expected}". Found classes: ${classListStr}`
          : `Expected element to have class containing "${expected}". Found classes: ${classListStr}`
      },
    }
  },
}
