import {
  calculateSnappedSpacing,
  isOnBaseline,
  nextSnap,
} from '@baseline-kit/core'

describe('calculateSnappedSpacing', () => {
  const base = 8

  describe('when snapping is "none"', () => {
    it('returns the initial spacing unchanged when provided as an object', () => {
      const initial = { top: 10, right: 20, bottom: 30, left: 40 }
      const result = calculateSnappedSpacing(100, base, initial, 'none')
      expect(result).toEqual(initial)
    })

    it('returns the initial spacing unchanged when provided as a number', () => {
      const initial = 15
      const result = calculateSnappedSpacing(100, base, initial, 'none')
      expect(result).toEqual({ top: 15, right: 15, bottom: 15, left: 15 })
    })
  })

  describe('when snapping is "height"', () => {
    it('adjusts only the bottom padding if height is not a multiple of base', () => {
      // With base=8 and height=46: remainder = 46 % 8 = 6 → adjustment = 8 - 6 = 2.
      // Starting with initial spacing {top: 10, right: 10, bottom: 10, left: 10},
      // bottom becomes 10 + 2 = 12.
      const initial = { top: 10, right: 10, bottom: 10, left: 10 }
      const result = calculateSnappedSpacing(46, base, initial, 'height')
      expect(result).toEqual({ top: 10, right: 10, bottom: 12, left: 10 })
    })

    it('leaves the spacing unchanged if the height is already a multiple of base', () => {
      const initial = { top: 10, right: 10, bottom: 10, left: 10 }
      const result = calculateSnappedSpacing(48, base, initial, 'height')
      expect(result).toEqual(initial)
    })

    it('adjusts only the top padding when snapEdge is "top"', () => {
      // With base=8 and height=46, the 2px complement is added to top.
      const initial = { top: 10, right: 10, bottom: 10, left: 10 }
      const result = calculateSnappedSpacing(46, base, initial, {
        mode: 'height',
        snapEdge: 'top',
      })
      expect(result).toEqual({ top: 12, right: 10, bottom: 10, left: 10 })
    })

    it('keeps bottom as the default snap edge', () => {
      const initial = { top: 10, right: 10, bottom: 10, left: 10 }
      const result = calculateSnappedSpacing(46, base, initial, 'height')
      expect(result).toEqual({ top: 10, right: 10, bottom: 12, left: 10 })
    })

    it('preserves fractional CSS pixels when closing a subpixel remainder', () => {
      const height = 6.123
      const result = calculateSnappedSpacing(height, base, 0, {
        mode: 'height',
        snapEdge: 'top',
      })

      expect(result.top).toBeCloseTo(1.877, 10)
      expect(height + result.top).toBeCloseTo(base, 10)
    })
  })

  describe('when snapping is "clamp"', () => {
    it('clamps top and adjusts bottom padding for non-multiple heights with object spacing', () => {
      // Example: initial = { top: 10, right: 0, bottom: 6, left: 0 }
      // For height=45: remainder = 45 % 8 = 5.
      // Bottom becomes: 6 + (8 - 5) = 6 + 3 = 9, then 9 % 8 = 1.
      // Top becomes: 10 % 8 = 2.
      const initial = { top: 10, right: 0, bottom: 6, left: 0 }
      const result = calculateSnappedSpacing(45, base, initial, 'clamp')
      expect(result).toEqual({ top: 2, right: 0, bottom: 1, left: 0 })
    })

    it('clamps top and adjusts bottom padding for non-multiple heights when initial spacing is a number', () => {
      // With initial = 15 (i.e. {top:15, right:15, bottom:15, left:15}) and height=45:
      // - Top becomes: 15 % 8 = 7.
      // - Bottom is adjusted: 15 + (8 - 5) = 18, then 18 % 8 = 2.
      const initial = 15
      const result = calculateSnappedSpacing(45, base, initial, 'clamp')
      expect(result).toEqual({ top: 7, right: 15, bottom: 2, left: 15 })
    })

    it('applies clamp even when height is a multiple of base', () => {
      // For height=48 (a multiple of 8) and initial = {top:10, right:20, bottom:30, left:40}:
      // - Top becomes 10 % 8 = 2.
      // - Bottom becomes 30 % 8 = 6.
      // Right and left remain unchanged.
      const initial = { top: 10, right: 20, bottom: 30, left: 40 }
      const result = calculateSnappedSpacing(48, base, initial, 'clamp')
      expect(result).toEqual({ top: 2, right: 20, bottom: 6, left: 40 })
    })
  })

  describe('measurement noise', () => {
    const initial = { top: 8, right: 0, bottom: 8, left: 0 }

    it('treats residues off the layout-unit grid as aligned', () => {
      // Sub-unit noise and residues seen under zoom (e.g. CSS zoom in
      // WebKit): none are whole 1/64px or 1/60px units.
      for (const height of [
        40.0000076, 39.99, 40.005, 40.0057, 120.028, 72.017, 96.023, 288.017,
        24.025, 23.975,
      ]) {
        expect(
          calculateSnappedSpacing(height, base, initial, {
            mode: 'height',
            snapEdge: 'top',
          })
        ).toEqual(initial)
        expect(calculateSnappedSpacing(height, base, initial, 'clamp')).toEqual(
          { top: 0, right: 0, bottom: 0, left: 0 }
        )
        expect(isOnBaseline(height, base)).toBe(true)
      }
    })

    it('treats every residue under 1/32px as aligned on a scaled page', () => {
      // 96.0156 was measured at 80% display scaling and is almost exactly one
      // 1/64px unit, so only the scale tells it apart from real geometry.
      for (const height of [96.0156, 40.015625, 120.028, 39.97]) {
        expect(isOnBaseline(height, base, true)).toBe(true)
        expect(
          calculateSnappedSpacing(height, base, initial, {
            mode: 'height',
            scaled: true,
          })
        ).toEqual(initial)
      }
      expect(isOnBaseline(96.0156, base)).toBe(false)
    })

    it('accepts Firefox float32 sizes as whole 1/60px units', () => {
      // Firefox reports 8 + 1/60 as 8.01666259765625.
      expect(isOnBaseline(8.01666259765625, base)).toBe(false)
      expect(
        calculateSnappedSpacing(8.01666259765625, base, initial, 'height')
          .bottom
      ).toBeCloseTo(8 + 8 - 8.01666259765625 + 8, 5)
    })

    it('snaps real heights that are whole layout units off the grid', () => {
      // One or more 1/64px units (Chromium, WebKit) or 1/60px units (Firefox),
      // e.g. Times New Roman 18px trims to 8.046875px.
      for (const height of [
        8.046875,
        40.015625,
        39.984375,
        40.03125,
        24.0625,
        40 + 1 / 60,
        8.05,
      ]) {
        expect(isOnBaseline(height, base)).toBe(false)
        const { top } = calculateSnappedSpacing(
          height,
          base,
          { top: 0, right: 0, bottom: 0, left: 0 },
          { mode: 'height', snapEdge: 'top' }
        )
        expect((height + top) % base).toBe(0)
      }
    })

    it('snaps fractional text heights exactly onto the grid', () => {
      const result = calculateSnappedSpacing(
        8.734375,
        base,
        { top: 0, right: 0, bottom: 0, left: 0 },
        { mode: 'height', snapEdge: 'top' }
      )
      expect(8.734375 + result.top).toBe(16)
      expect(isOnBaseline(8.734375, base)).toBe(false)
    })
  })

  describe('tolerance boundary', () => {
    it('snaps remainders of 1/32px and more', () => {
      expect(isOnBaseline(40.03125, base)).toBe(false)
      expect(isOnBaseline(40.07, base)).toBe(false)
    })

    it('ignores floating-point error with non-binary bases', () => {
      // 46 % 9.2 is about 3.6e-15, not 0.
      for (const [height, gridBase] of [
        [46, 9.2],
        [48, 9.6],
        [43.8, 7.3],
        [24, 4.8],
      ] as const) {
        expect(isOnBaseline(height, gridBase)).toBe(true)
        expect(
          calculateSnappedSpacing(
            height,
            gridBase,
            { top: 0, right: 0, bottom: 0, left: 0 },
            'height'
          ).bottom
        ).toBe(0)
      }
    })
  })

  describe('bases of 1px or less', () => {
    it('leave the padding unchanged, so the outer Box does the snapping', () => {
      const initial = { top: 2, right: 0, bottom: 3, left: 0 }
      for (const mode of ['height', 'clamp'] as const) {
        expect(calculateSnappedSpacing(8.297, 1, initial, mode)).toEqual(
          initial
        )
        expect(calculateSnappedSpacing(8.297, 0.5, initial, mode)).toEqual(
          initial
        )
      }
    })
  })
})

describe('nextSnap', () => {
  const zero = { top: 0, right: 0, bottom: 0, left: 0 }
  const input = {
    base: 8,
    mode: 'height' as const,
    snapEdge: 'top' as const,
    initial: zero,
  }
  const first = nextSnap(null, input, {
    height: 10.5,
    rendered: zero,
    settling: true,
  })!

  it('snaps the first measurement', () => {
    expect(first.padding.top).toBe(5.5)
    expect(first.natural).toBe(10.5)
  })

  it('keeps the snap when the height does not change (fixed-height Box)', () => {
    const rendered = first.padding
    expect(
      nextSnap(first, input, { height: 10.5, rendered, settling: true })
    ).toBe(first)
  })

  it('ignores float noise in a fixed height', () => {
    // Firefox reports 100.79999 for a 100.8px height as the box moves.
    expect(
      nextSnap(first, input, {
        height: 10.5 - 1e-5,
        rendered: first.padding,
        settling: true,
      })
    ).toBe(first)
  })

  it('re-snaps a grid height measured before its padding committed', () => {
    const snap = nextSnap(null, input, {
      height: 100,
      rendered: zero,
      settling: true,
    })!
    expect(snap.padding.top).toBe(4)
    // Content grew to 104 while the 4px padding was still uncommitted: 104 is
    // on the grid, but keeping that padding would render 108.
    const next = nextSnap(snap, input, {
      height: 104,
      rendered: zero,
      settling: true,
    })!
    expect(next.padding.top).toBe(0)
  })

  it('keeps the snap once its own correction shows up in the height', () => {
    const next = nextSnap(first, input, {
      height: 16,
      rendered: first.padding,
      settling: true,
    })!
    expect(next.padding).toEqual(first.padding)
    expect(next.height).toBe(16)
  })

  it('re-snaps a natural height change while settling, not after', () => {
    const grown = { height: 19, rendered: first.padding, settling: true }
    expect(nextSnap(first, input, grown)!.padding.top).toBe(2.5)
    expect(nextSnap(first, input, { ...grown, settling: false })).toBe(first)
  })

  it('re-snaps when the inputs change, even after settling', () => {
    const moved = nextSnap(
      first,
      { ...input, initial: { ...zero, top: 8 } },
      { height: 16, rendered: first.padding, settling: false }
    )!
    // 10.5px content + 8px top = 18.5px, snapped to 24px.
    expect(moved.padding.top).toBe(13.5)
  })

  it('clears the snap when snapping is none, so switching back snaps afresh', () => {
    expect(
      nextSnap(
        first,
        { ...input, mode: 'none' },
        { height: 30, rendered: zero, settling: true }
      )
    ).toBeNull()
  })

  it('re-snaps a content change by default', () => {
    // No settling flag: 7.1 follows every size change.
    const next = nextSnap(first, input, {
      height: 12.5 + first.padding.top,
      rendered: first.padding,
    })!
    expect(next.padding.top).toBe(3.5)
  })

  // A host with a height floor or fill renders max(floor, content + padding),
  // so its natural height moves with its own padding.
  function settleFloor(
    content: number,
    floor: number,
    mode: 'height' | 'clamp'
  ) {
    const floorInput = { ...input, mode, snapEdge: 'bottom' as const }
    let rendered = zero
    let snap: ReturnType<typeof nextSnap> = null
    let last = -1
    for (let measurement = 0; measurement < 20; measurement++) {
      const height = Math.max(floor, content + rendered.top + rendered.bottom)
      // A ResizeObserver reports only size changes.
      if (height === last) return { measurement, height }
      last = height
      snap = nextSnap(snap, floorInput, { height, rendered })
      rendered = snap?.padding ?? zero
    }
    return { measurement: Infinity, height: last }
  }

  it('settles on the grid when padding only partly moves the height', () => {
    // 99 -> 101 -> 99 used to repeat forever.
    for (const mode of ['height', 'clamp'] as const) {
      expect(settleFloor(96, 99, mode)).toEqual({ measurement: 5, height: 104 })
    }
  })

  it('ends where a fresh snap does after content toggles back and forth', () => {
    for (const mode of ['height', 'clamp'] as const) {
      const toggleInput = { ...input, mode, snapEdge: 'bottom' as const }
      for (const [a, b] of [
        [10, 9],
        [41.6, 62.4],
        [21, 18],
      ]) {
        let rendered = zero
        let snap: ReturnType<typeof nextSnap> = null
        const measure = (content: number) => {
          // Two measurements per change: the content, then the correction.
          for (let pass = 0; pass < 2; pass++) {
            snap = nextSnap(snap, toggleInput, {
              height: content + rendered.top + rendered.bottom,
              rendered,
            })
            rendered = snap!.padding
          }
        }
        for (let toggle = 0; toggle < 10; toggle++) {
          measure(a)
          measure(b)
        }
        measure(a)
        const fresh = nextSnap(null, toggleInput, { height: a, rendered: zero })
        expect(rendered).toEqual(fresh!.padding)
      }
    }
  })

  it('ends where a fresh snap does when corrections land a measurement late', () => {
    // Remix delivers a measurement a frame late, so content can change back
    // in the same measurement where the previous correction lands.
    for (const mode of ['height', 'clamp'] as const) {
      const lagInput = { ...input, mode, snapEdge: 'bottom' as const }
      for (const [a, b] of [
        [10, 9],
        [21, 18],
      ]) {
        let committed = zero
        let pending = zero
        let snap: ReturnType<typeof nextSnap> = null
        const measure = (content: number) => {
          snap = nextSnap(snap, lagInput, {
            height: content + committed.top + committed.bottom,
            rendered: committed,
          })
          committed = pending
          pending = snap!.padding
        }
        for (let toggle = 0; toggle < 10; toggle++) {
          measure(a)
          measure(b)
        }
        for (let settle = 0; settle < 6; settle++) measure(a)
        const fresh = nextSnap(null, lagInput, { height: a, rendered: zero })
        expect(committed).toEqual(fresh!.padding)
      }
    }
  })

  it('never bounces on a host with a height floor', () => {
    for (const mode of ['height', 'clamp'] as const) {
      for (let floor = 80; floor <= 120; floor += 0.5) {
        for (let content = 60; content <= 130; content += 0.75) {
          const { measurement, height } = settleFloor(content, floor, mode)
          expect(measurement).toBeLessThan(20)
          // Either on the grid, or held by a floor that padding can't move.
          if (height !== floor) expect(height % 8).toBe(0)
        }
      }
    }
  })

  it('settles instead of flapping when layout rounds at a fractional scale', () => {
    // At 1.25x Chromium lays out in 1/80px and floors the padding tracks
    // (48.0375 + 7.9625 measured 55.9875), so each correction shifts the
    // measured natural height a little. Near the 1/32px boundary that used to
    // alternate between "aligned" and "add a row" for the whole window.
    const floor = (value: number) => Math.floor(value * 80) / 80
    for (const content of [48.0375, 48.0375 + 1 / 80, 40.0375, 39.9625]) {
      let snap = null as ReturnType<typeof nextSnap>
      const paddings = new Set<string>()
      for (let step = 0; step < 12; step += 1) {
        const rendered = snap?.padding ?? zero
        const height = content + floor(rendered.top) + floor(rendered.bottom)
        snap = nextSnap(snap, input, {
          height,
          rendered,
          settling: true,
          scaled: true,
        })
        if (step > 2) paddings.add(JSON.stringify(snap!.padding))
      }
      expect(paddings.size).toBe(1)
    }
  })
})
