import { resolve } from 'path'

export const alias = {
  '@': resolve(__dirname, 'src/lib'),
  '@components': resolve(__dirname, 'src/lib/components'),
  '@context': resolve(__dirname, 'src/lib/context'),
  '@hooks': resolve(__dirname, 'src/lib/hooks'),
  '@types': resolve(__dirname, 'src/lib/types'),
  '@utils': resolve(__dirname, 'src/lib/utils'),
}