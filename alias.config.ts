import { resolve } from 'path'

const projectRoot = import.meta.dirname

export const alias = {
  '@baseline-kit/core': resolve(projectRoot, 'packages/core/src'),
  '@baseline-kit/dom': resolve(projectRoot, 'packages/dom/src'),
  '@baseline-kit/react': resolve(projectRoot, 'packages/react/src'),
  '@baseline-kit/remix': resolve(projectRoot, 'packages/remix/src'),
}
