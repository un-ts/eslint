/* eslint-disable unicorn/no-await-expression-member */
import path from 'node:path'

import type { TextlintResult, TextlintFixResult } from '@textlint/kernel'
import { cosmiconfig } from 'cosmiconfig'
import type { CosmiconfigResult } from 'cosmiconfig/dist/types'
import { extractProperties, runAsWorker } from 'synckit'
import { textlint } from 'textlint'
import type { FrozenProcessor, Plugin } from 'unified'
import type { VFileMessage } from 'vfile-message'

import { arrayify, loadEsmModule, loadModule, requirePkg } from './helpers'
import {
  UnifiedConfig,
  UnifiedPlugin,
  WorkerOptions,
  WorkerResult,
} from './types'

const explorer = cosmiconfig('retext', {
  packageProp: 'retextConfig',
  loaders: {
    '.js': (filepath: string) => loadModule(filepath),
  },
})

export const processorCache = new Map<string, FrozenProcessor>()

export const getRetextProcessor = async (
  searchFrom: string,
  ignoreRetextConfig?: boolean,
) => {
  const initCacheKey = searchFrom

  let cachedProcessor = processorCache.get(initCacheKey)

  if (cachedProcessor) {
    return cachedProcessor
  }

  const result: CosmiconfigResult = ignoreRetextConfig
    ? null
    : await explorer.search(searchFrom)

  const cacheKey = result ? result.filepath : ''

  cachedProcessor = processorCache.get(cacheKey)

  if (cachedProcessor) {
    return cachedProcessor
  }

  const { unified } = await loadEsmModule<typeof import('unified')>('unified')

  const retextStringify = (
    await loadEsmModule<typeof import('retext-stringify')>('retext-stringify')
  ).default

  if (result) {
    const { plugins = [], settings } =
      // type-coverage:ignore-next-line -- cosmiconfig's typings issue
      (result.config || {}) as Partial<UnifiedConfig>

    cachedProcessor = (
      await plugins.reduce(async (processor, pluginWithSettings) => {
        const [plugin, ...pluginSettings] = arrayify(pluginWithSettings) as [
          UnifiedPlugin,
          ...unknown[],
        ]
        return (await processor).use(
          /* istanbul ignore next */
          typeof plugin === 'string'
            ? await requirePkg<Plugin>(plugin, 'retext', result.filepath)
            : plugin,
          ...pluginSettings,
        )
      }, Promise.resolve(unified().use({ settings })))
    )
      .use(retextStringify)
      .freeze()
  } else {
    cachedProcessor = unified().use(retextStringify).freeze()
  }

  processorCache
    .set(initCacheKey, cachedProcessor)
    .set(cacheKey, cachedProcessor)

  return cachedProcessor
}

export const isTextlintFixResult = (
  result: TextlintResult,
): result is TextlintFixResult => 'output' in result

runAsWorker(
  async ({
    text,
    filename,
    linter,
    fix,
    ignoreRetextConfig,
  }: WorkerOptions): Promise<WorkerResult> => {
    switch (linter) {
      case 'retext': {
        const processor = await getRetextProcessor(filename, ignoreRetextConfig)

        const { VFile } = await loadEsmModule<typeof import('vfile')>('vfile')
        const file = new VFile({})
        try {
          await processor.process(file)
        } catch (err) {
          const error = err as VFileMessage
          if (!file.messages.includes(error)) {
            file.message(error).fatal = true
          }
        }
        return {
          messages: file.messages.map(message => extractProperties(message)),
          content: file.toString(),
        }
      }
      case 'textlint': {
        const result: TextlintFixResult | TextlintResult = await textlint[
          fix ? 'fixText' : 'lintText'
        ](text, path.extname(filename))
        return {
          messages: result.messages,
          content: isTextlintFixResult(result) ? result.output : text,
        }
      }
      default: {
        throw new RangeError(`Unknown linter: ${linter as string}`)
      }
    }
  },
)
