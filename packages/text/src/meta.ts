import { loadModule } from 'eslint-plugin-utils'

export const { name, version } = loadModule<
  { name: string; version: string },
  true
>(new URL('../package.json', import.meta.url))
