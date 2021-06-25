import { Linter } from 'eslint'

export const base: Linter.Config = {
  parser: 'eslint-plugin-htm',
  plugins: ['htm', 'utils'],
  processor: 'utils/jsonMessage',
}

export const recommended: Linter.Config = {
  ...base,
  rules: {
    'htm/html': 1,
  },
}
