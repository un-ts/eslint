import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import type { TSESLint } from '@typescript-eslint/utils'

/* istanbul ignore next */
export const loadEsmModule = <T>(modulePath: URL | string): Promise<T> =>
  // eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-call
  new Function('modulePath', `return import(modulePath);`)(
    modulePath,
  ) as Promise<T>

const cjsRequire =
  typeof require === 'undefined' ? createRequire(import.meta.url) : require

const interceptDefault = async <T>(promise: Promise<{ default: T }>) =>
  promise.then(({ default: value }) => value)

/**
 * ! copied from https://github.com/just-jeb/angular-builders/blob/master/packages/custom-webpack/src/utils.ts#L53-L67
 *
 * This uses a dynamic import to load a module which may be ESM.
 * CommonJS code can load ESM code via a dynamic import. Unfortunately, TypeScript
 * will currently, unconditionally downlevel dynamic import into a require call.
 * require calls cannot load ESM code and will result in a runtime error. To workaround
 * this, a Function constructor is used to prevent TypeScript from changing the dynamic import.
 * Once TypeScript provides support for keeping the dynamic import this workaround can
 * be dropped.
 *
 * @param modulePath The path of the module to load.
 * @returns A Promise that resolves to the dynamically imported module.
 */

/**
 * Loads JSON, CJS and ESM modules based on extension
 * @param modulePathname pathname or url of the module
 * @returns
 */
export function loadModule<T>(modulePathname: URL | string): Promise<T>
export function loadModule<T, _Sync extends true>(
  modulePathname: URL | string,
): T
// eslint-disable-next-line sonarjs/function-return-type
export function loadModule<T>(modulePathname: URL | string): Promise<T> | T {
  const modulePath =
    typeof modulePathname === 'string'
      ? modulePathname
      : fileURLToPath(modulePathname)

  const getEsModulePath = () =>
    path.isAbsolute(modulePath) ? pathToFileURL(modulePath) : modulePath

  switch (path.extname(modulePath)) {
    /* istanbul ignore next */
    case '.mjs': {
      return interceptDefault(loadEsmModule(getEsModulePath()))
    }
    /* istanbul ignore next */
    case '.cjs': {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return cjsRequire(modulePath)
    }
    default: {
      // The file could be either CommonJS or ESM.
      // CommonJS is tried first then ESM if loading fails.
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return cjsRequire(modulePath)
      } catch (err) {
        /* istanbul ignore if */
        if ((err as { code: string }).code === 'ERR_REQUIRE_ESM') {
          // Load the ESM configuration file using the TypeScript dynamic import workaround.
          // Once TypeScript provides support for keeping the dynamic import this workaround can be
          // changed to a direct dynamic import.
          return interceptDefault(loadEsmModule(getEsModulePath()))
        }

        throw err
      }
    }
  }
}

export const requirePkg = async <T>(
  plugin: string,
  prefix: string,
  filePath?: string,
): Promise<T> => {
  let packages: string[]
  if (filePath && /^\.\.?(?:[/\\]|$)/.test(plugin)) {
    packages = [path.resolve(path.dirname(filePath), plugin)]
  } else {
    prefix = prefix.endsWith('-') ? prefix : prefix + '-'
    packages = [
      plugin,
      /* istanbul ignore next */
      plugin.startsWith('@')
        ? plugin.replace('/', '/' + prefix)
        : prefix + plugin,
    ]
  }
  let error: Error | undefined
  for (const pkg of packages) {
    try {
      return await loadModule<T>(pkg)
    } catch (err) {
      if (!error) {
        error = err as Error
      }
    }
  }
  throw error!
}

export interface JsonMessage {
  severity?: TSESLint.Linter.Severity
  message: string
  ruleId: string
}

export type JsonMessageHandler<T> = (
  jsonMessage: T,
  lintMessage: TSESLint.Linter.LintMessage,
) => JsonMessage

// @internal
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const jsonMessageHandlers = new Map<string, JsonMessageHandler<any>>()

export const registerJsonMessageHandler = <T>(
  ruleId: string,
  handler: JsonMessageHandler<T>,
) => {
  /* istanbul ignore if */
  if (jsonMessageHandlers.has(ruleId)) {
    console.warn(
      `The ruleId ${ruleId} has already been registered, please mark sure you know what you're doing!`,
    )
  }

  jsonMessageHandlers.set(ruleId, handler)
}
