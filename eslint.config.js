import { createRequire } from 'node:module'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import prettierPlugin from 'eslint-plugin-prettier'

// TypeScript 7 is the project compiler. typescript-eslint has not released a
// parser API compatible with TypeScript 7 yet, so load the lint parser and
// plugin against an isolated TypeScript 6 compatibility runtime. This keeps
// ESLint operational without downgrading the compiler used by the package.
const require = createRequire(import.meta.url)
const nodeModule = require('node:module')
const originalModuleLoad = nodeModule._load
const typescriptApi = require.resolve('@typescript/typescript6')
let typescriptPlugin
let parser

try {
  nodeModule._load = function loadTypescriptEslintDependency(
    request,
    parent,
    isMain
  ) {
    if (request === 'typescript') {
      return originalModuleLoad(typescriptApi, parent, isMain)
    }

    return originalModuleLoad(request, parent, isMain)
  }

  typescriptPlugin = require('@typescript-eslint/eslint-plugin')
  parser = require('@typescript-eslint/parser')
} finally {
  nodeModule._load = originalModuleLoad
}

export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      prettier: prettierPlugin,
    },
    settings: {
      react: {
        version: '19.3.0',
      },
    },
    rules: {
      ...typescriptPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      // eslint-plugin-react@7.37.5 calls the removed ESLint 9 context API for
      // this rule under ESLint 10. Keep the rest of the React rules enabled;
      // restore this rule when its upstream compatibility is released.
      'react/display-name': 'off',
      // These rules are intentionally relaxed for the existing measurement
      // latch and the SSR hydration boundary; both are safe, deliberate
      // synchronization points rather than render-time data dependencies.
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/max-params': ['error', { max: 4 }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      indent: 'off',
      semi: 'off',
      quotes: 'off',
      'prettier/prettier': 'error',
    },
  },
  {
    files: ['packages/remix/src/**/*.{ts,tsx}'],
    rules: {
      // Remix supplies its own JSX runtime; importing React here would make
      // the React-free adapter depend on React at runtime.
      'react/react-in-jsx-scope': 'off',
      // `mix` is a Remix host-element prop, not a React DOM attribute.
      'react/no-unknown-property': ['error', { ignore: ['mix'] }],
    },
  },
]
