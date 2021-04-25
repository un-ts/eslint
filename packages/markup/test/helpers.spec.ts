import { createSyncFn } from 'eslint-plugin-markup'

test('createSyncFn', () => {
  expect(() => createSyncFn('./fake')).toThrow('`workerPath` must be absolute')
  expect(() => createSyncFn(require.resolve('eslint'))).not.toThrow()
})
