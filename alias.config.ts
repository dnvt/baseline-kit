import { resolve } from 'path'

export const alias = {
  '@': resolve(__dirname, 'src'),
  '@kit': resolve(__dirname, '.'),
  '@components': resolve(__dirname, 'src/components'),
  '@context': resolve(__dirname, 'src/context'),
  '@hooks': resolve(__dirname, 'src/hooks'),
  '@types': resolve(__dirname, 'src/types'),
  '@utils': resolve(__dirname, 'src/utils'),
}