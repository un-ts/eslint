import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { loadModule } from 'eslint-plugin-utils'

const createFixture = async (
  name: string,
  source: string,
  packageJson?: string,
) => {
  const dir = await mkdtemp(path.join(tmpdir(), 'eslint-plugin-utils-'))
  if (packageJson) {
    await writeFile(path.join(dir, 'package.json'), packageJson)
  }
  const file = path.join(dir, name)
  await writeFile(file, source)
  return file
}

describe('loadModule', () => {
  it('loads an ESM module and unwraps its default export', async () => {
    const file = await createFixture(
      'esm.mjs',
      "export default { type: 'esm' }\nexport const named = 'named'\n",
    )
    await expect(loadModule<{ type: string }>(file)).resolves.toEqual({
      type: 'esm',
    })
  })

  it('loads a CommonJS module', async () => {
    const file = await createFixture(
      'cjs.cjs',
      "module.exports = { type: 'cjs' }\n",
    )
    expect(loadModule<{ type: string }>(file)).toEqual({ type: 'cjs' })
  })

  it('falls back to a dynamic import when require cannot load ESM', async () => {
    const file = await createFixture(
      'esm.js',
      "await Promise.resolve()\nexport default { type: 'esm-js' }\n",
      '{ "type": "module" }\n',
    )
    await expect(loadModule<{ type: string }>(file)).resolves.toEqual({
      type: 'esm-js',
    })
  })
})
