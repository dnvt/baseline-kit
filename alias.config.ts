import { resolve } from 'path'

const projectRoot = import.meta.dirname

export const alias = {
  // Package aliases (new monorepo structure)
  '@baseline-kit/core': resolve(projectRoot, 'packages/core/src'),
  '@baseline-kit/dom': resolve(projectRoot, 'packages/dom/src'),
  '@baseline-kit/react': resolve(projectRoot, 'packages/react/src'),
  '@baseline-kit/remix': resolve(projectRoot, 'packages/remix/src'),

  // Backwards-compatible aliases (map to new locations)
  '@': resolve(projectRoot, 'packages/react/src'),
  '@kit': resolve(projectRoot, '.'),
  '@components': resolve(projectRoot, 'packages/react/src/components'),
  '@hooks': resolve(projectRoot, 'packages/react/src/hooks'),
  '@utils': resolve(projectRoot, 'packages/react/src/utils'),
}
