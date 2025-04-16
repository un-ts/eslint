import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { cjsRequire, EVAL_FILENAMES } from '@pkgr/core'

const _filename =
  typeof __filename === 'undefined' || EVAL_FILENAMES.has(__filename)
    ? fileURLToPath(import.meta.url)
    : __filename

export const { name, version } = cjsRequire<{ name: string; version: string }>(
  path.resolve(_filename, '../../package.json'),
)
