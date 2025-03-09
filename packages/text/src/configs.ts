import type { TSESLint } from '@typescript-eslint/utils'

export const base: TSESLint.ClassicConfig.Config = {
  parser: 'eslint-plugin-text',
  plugins: ['text', 'utils'],
  processor: 'utils/jsonMessage',
}

export const recommended: TSESLint.ClassicConfig.Config = {
  ...base,
  rules: {
    'text/retext': 1,
    'text/textlint': 1,
  },
}

export const retext: TSESLint.ClassicConfig.Config = {
  ...base,
  rules: {
    'text/retext': 1,
  },
}

export const textlint: TSESLint.ClassicConfig.Config = {
  ...base,
  rules: {
    'text/textlint': 1,
  },
}
