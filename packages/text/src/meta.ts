import path from 'node:path'

import { cjsRequire } from '@pkgr/core'

import { _dirname } from './constants.ts'

export const { name, version } = cjsRequire<{ name: string; version: string }>(
  path.resolve(_dirname, '../package.json'),
)
