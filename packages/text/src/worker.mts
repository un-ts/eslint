import path from 'node:path'

import { loadConfig } from '@textlint/config-loader'
import type { TextlintFixResult, TextlintResult } from '@textlint/kernel'
import { loadModule, requirePkg } from 'eslint-plugin-utils'
import { lilconfig, type LilconfigResult } from 'lilconfig'
import type { Root } from 'nlcst'
import retextStringify from 'retext-stringify'
import { extractProperties, runAsWorker } from 'synckit'
import { createLinter, loadTextlintrc } from 'textlint'
import { unified, type Plugin, type Processor } from 'unified'
import { VFile } from 'vfile'
import type { VFileMessage } from 'vfile-message'

import { arrayify } from './helpers.js'
import type {
  UnifiedConfig,
  UnifiedPlugin,
  WorkerOptions,
  WorkerResult,
} from './types.js'

const explorer = lilconfig('retext', {
  packageProp: 'retextConfig',
  loaders: {
    '.js': loadModule,
  },
})

export const processorCache = new Map<
  string,
  Processor<undefined, undefined, undefined, Root, string>
>()

export const getRetextProcessor = async (
  searchFrom: string,
  ignoreRetextConfig?: boolean,
) => {
  const initCacheKey = searchFrom

  let cachedProcessor = processorCache.get(initCacheKey)

  if (cachedProcessor) {
    return cachedProcessor
  }

  const result: LilconfigResult = ignoreRetextConfig
    ? null
    : await explorer.search(searchFrom)

  const cacheKey = result ? result.filepath : ''

  cachedProcessor = processorCache.get(cacheKey)

  if (cachedProcessor) {
    return cachedProcessor
  }

  if (result) {
    const { plugins = [], settings } =
      // type-coverage:ignore-next-line -- lilconfig's typings issue
      (result.config || {}) as Partial<UnifiedConfig>

    const reducedProcessor = await plugins.reduce(
      async (processor_, pluginWithSettings) => {
        const [plugin, ...pluginSettings] = arrayify(pluginWithSettings) as [
          UnifiedPlugin,
          ...[],
        ]
        const processor = await processor_
        return processor.use(
          /* istanbul ignore next */
          typeof plugin === 'string'
            ? await requirePkg<Plugin>(plugin, 'retext', result.filepath)
            : plugin,
          ...pluginSettings,
        ) as unknown as Processor
      },
      Promise.resolve(unified().use({ settings })),
    )

    cachedProcessor = reducedProcessor.use(retextStringify).freeze()
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

export type TextLinter = ReturnType<typeof createLinter>

const textlintCache = new Map<string, TextLinter>()

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

        const file = new VFile({
          value: text,
          path: filename,
        })
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
        let textlint: TextLinter

        if (textlintCache.has(filename)) {
          textlint = textlintCache.get(filename)!
        } else {
          const cwd = path.dirname(filename)
          const config = await loadConfig({ cwd })
          const textlintrcDescriptor = await loadTextlintrc({
            configFilePath: config.configFilePath,
          })

          textlint = createLinter({
            descriptor: textlintrcDescriptor,
            cwd,
          })
          textlintCache.set(filename, textlint)
        }

        const result = await textlint[fix ? 'fixText' : 'lintText'](
          text,
          filename,
        )
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
