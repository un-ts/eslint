import path from 'path'
import fs from 'fs'

import { cosmiconfigSync } from 'cosmiconfig'

/**
 * Given a filepath, get the nearest path that is a regular file.
 * The filepath provided by eslint may be a virtual filepath rather than a file
 * on disk. This attempts to transform a virtual path into an on-disk path
 * @param {string} filename
 * @returns {string}
 */
export const getPhysicalFilename = (filename: string): string => {
  try {
    if (fs.statSync(filename).isFile()) {
      return filename
    }
  } catch (err) {
    // https://github.com/eslint/eslint/issues/11989
    if ((err as { code: string }).code === 'ENOTDIR') {
      return getPhysicalFilename(path.dirname(filename))
    }
  }

  return filename
}

const explorer = cosmiconfigSync('markuplint')

export const resolveConfig = (filename: string) => {
  const result = explorer.search(filename)
  return result ? result.filepath : undefined
}
