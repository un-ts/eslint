import path from 'node:path'
import { fileURLToPath } from 'node:url'

const _filename =
  typeof __filename === 'undefined'
    ? fileURLToPath(import.meta.url)
    : __filename

export const _dirname = path.dirname(_filename)
