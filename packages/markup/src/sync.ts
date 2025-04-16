import path from 'node:path'

import type { Target } from '@markuplint/file-resolver'
import type { Violation } from '@markuplint/ml-config'
import { createSyncFn } from 'synckit'

import { _dirname } from './constants.js'

const workerPath = path.resolve(_dirname, './worker.js')

// call `createSyncFn` lazily for performance, it is already cached inside, related #31
export const sync = {
  get markuplintSync() {
    return createSyncFn<
      (
        target: Target,
        fix?: boolean,
      ) => Promise<{ violations: Violation[]; fixedCode: string }>
    >(workerPath)
  },
}
