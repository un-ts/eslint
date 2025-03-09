import type { TSESLint } from '@typescript-eslint/utils'

export const base: TSESLint.ClassicConfig.Config = {
  parser: 'eslint-plugin-markup',
  plugins: ['markup', 'utils'],
  processor: 'utils/jsonMessage',
}

export const recommended: TSESLint.ClassicConfig.Config = {
  ...base,
  rules: {
    'markup/markup': 1,
  },
}
