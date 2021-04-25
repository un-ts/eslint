import { execSync } from 'child_process'
import { tmpdir } from 'os'
import path from 'path'
import fs from 'fs'

import { v4 as uuid } from 'uuid'
import { cosmiconfigSync } from 'cosmiconfig'

// https://github.com/sindresorhus/temp-dir/blob/main/index.js#L9
const dirname = fs.realpathSync(tmpdir())

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createSyncFn = <T extends (...arg: any) => any>(
  workerPath: string,
) => {
  if (!path.isAbsolute(workerPath)) {
    throw new Error('`workerPath` must be absolute')
  }

  workerPath = require.resolve(workerPath)

  const executor = workerPath.endsWith('.ts') ? 'ts-node' : 'node'

  return (...args: Parameters<T>): ReturnType<T> => {
    const filename = path.resolve(dirname, `markuplint-${uuid()}.json`)
    fs.writeFileSync(filename, JSON.stringify(args))
    const command = `${executor} ${workerPath} ${filename}`

    try {
      execSync(command, {
        encoding: 'utf8',
      })
      const result = fs.readFileSync(filename, 'utf8')
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return JSON.parse(result)
    } finally {
      fs.unlinkSync(filename)
    }
  }
}

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
