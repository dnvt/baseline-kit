global.ResizeObserver = class {
  callback: ResizeObserverCallback

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }

  observe(target: Element) {
    this.callback(
      [{ target, contentRect: target.getBoundingClientRect() }],
      this as unknown as ResizeObserver,
    )
  }

  unobserve() {
  }

  disconnect() {
  }
}

// IntersectionObserver mock
global.IntersectionObserver = class {
  callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  observe(target: Element) {
    this.callback(
      [
        {
          target,
          isIntersecting: true,
          boundingClientRect: target.getBoundingClientRect(),
          intersectionRatio: 1,
          intersectionRect: target.getBoundingClientRect(),
          rootBounds: null,
          time: Date.now(),
        },
      ],
      this as unknown as IntersectionObserver,
    )
  }

  unobserve() {
  }

  disconnect() {
  }

  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}