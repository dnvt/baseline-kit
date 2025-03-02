/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

interface CustomMatchers<R = unknown> {
  toHaveGridStyle(expected: Record<string, string | number>): R;
  toHavePartialClassName(className: string): R;
}

declare module 'vitest' {
  interface Assertion extends CustomMatchers {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

declare module '@testing-library/jest-dom' {} 