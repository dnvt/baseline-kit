expect.extend({
  toHaveGridStyle(received: HTMLElement, expectedStyles: Record<string, string>) {
    const pass = Object.entries(expectedStyles).every(
      ([property, value]) => received.style.getPropertyValue(property) === value,
    )

    return {
      pass,
      message: () =>
        pass
          ? `expected element not to have grid styles ${JSON.stringify(expectedStyles)}`
          : `expected element to have grid styles ${JSON.stringify(expectedStyles)}`,
    }
  },
})
