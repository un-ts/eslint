import base from '@1stg/eslint-config'

export default [
  ...base,
  {
    files: ['**/test/fixtures/**'],
    rules: {
      'markup/markup': 'off',
    },
  },
]
