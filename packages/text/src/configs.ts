import { Linter } from 'eslint'

export const base: Linter.Config = {
  parser: 'eslint-plugin-text',
  plugins: ['text', 'utils'],
  processor: 'utils/jsonMessage',
}

export const recommended: Linter.Config = {
  ...base,
  rules: {
    'text/retext': 1,
    'text/textlint': 1,
  },
}

export const retext: Linter.Config = {
  ...base,
  rules: {
    'text/retext': 1,
  },
}

export const textlint: Linter.Config = {
  ...base,
  rules: {
    'text/textlint': 1,
  },
}
