import { resolve } from 'path'

export const alias = {
  // Package aliases (new monorepo structure)
  '@baseline-kit/core': resolve(__dirname, 'packages/core/src'),
  '@baseline-kit/dom': resolve(__dirname, 'packages/dom/src'),
  '@baseline-kit/react': resolve(__dirname, 'packages/react/src'),

  // Backwards-compatible aliases (map to new locations)
  '@': resolve(__dirname, 'packages/react/src'),
  '@kit': resolve(__dirname, '.'),
  '@components': resolve(__dirname, 'packages/react/src/components'),
  '@context': resolve(__dirname, 'packages/react/src/context'),
  '@hooks': resolve(__dirname, 'packages/react/src/hooks'),
  '@types': resolve(__dirname, 'packages/react/src/types'),
  '@utils': resolve(__dirname, 'packages/react/src/utils'),
}
