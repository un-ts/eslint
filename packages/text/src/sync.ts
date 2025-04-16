import path from 'node:path'

import { createSyncFn } from 'synckit'

import { _dirname } from './constants.js'
import type { Linter, WorkerOptions, WorkerResult } from './types.js'

export const lint = createSyncFn(path.resolve(_dirname, './worker.js')) as <
  T extends Linter,
>(
  options: WorkerOptions<T>,
) => WorkerResult<T>
