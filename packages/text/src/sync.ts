import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { createSyncFn } from 'synckit'

import type { Linter, WorkerOptions, WorkerResult } from './types.js'

const _dirname =
  typeof __dirname === 'undefined'
    ? path.dirname(fileURLToPath(import.meta.url))
    : __dirname

export const lint = createSyncFn(path.resolve(_dirname, './worker.mjs')) as <
  T extends Linter,
>(
  options: WorkerOptions<T>,
) => WorkerResult<T>
