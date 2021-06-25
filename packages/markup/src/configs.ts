import { Linter } from 'eslint'

export const base: Linter.Config = {
  parser: 'eslint-plugin-markup',
  plugins: ['markup', 'utils'],
  processor: 'utils/jsonMessage',
}

export const recommended: Linter.Config = {
  ...base,
  rules: {
    'markup/markup': 1,
  },
}
