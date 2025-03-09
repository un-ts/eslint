import type { TSESLint } from '@typescript-eslint/utils'

export const base: TSESLint.ClassicConfig.Config = {
  parser: 'eslint-plugin-htm',
  plugins: ['htm', 'utils'],
  processor: 'utils/jsonMessage',
}

export const recommended: TSESLint.ClassicConfig.Config = {
  ...base,
  rules: {
    'htm/html': 1,
  },
}
