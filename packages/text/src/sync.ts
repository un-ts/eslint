import { createSyncFn } from 'synckit'

import { Linter, WorkerOptions, WorkerResult } from './types'

export const lint = createSyncFn(require.resolve('./worker')) as <
  T extends Linter,
>(
  options: WorkerOptions<T>,
) => WorkerResult<T>
