import type { MLFile } from '@markuplint/file-resolver'
import {
  ConfigProvider,
  resolveFiles,
  resolveParser,
  resolveRules,
  resolveSpecs,
} from '@markuplint/file-resolver'
import type { MLASTDocument } from '@markuplint/ml-ast'
import type { Config, OptimizedConfig, Rules } from '@markuplint/ml-config'
import { MLCore, Ruleset } from '@markuplint/ml-core'
import { i18n } from 'markuplint'

export interface MarkupPassOptions {
  sourceCode: string
  filename: string
  /**
   * The markuplint rules ESLint asked for, by rule name, mapped to their configured options in
   * markuplint's own shape.
   */
  rules: Record<string, unknown>
  fix?: boolean
}

export interface MarkupViolation {
  ruleId: string
  severity: 'error' | 'info' | 'warning'
  message: string
  line: number
  col: number
  raw: string
}

export interface MarkupPassResult {
  violations: MarkupViolation[]
  fixedCode: string
  ast?: MLASTDocument
}

/** Applied when a file has no configuration of its own, matching what the CLI does. */
const RECOMMENDED: OptimizedConfig = { extends: ['markuplint:recommended'] }

/**
 * The markuplint rule configuration a pass runs with: what the file's own configuration enables,
 * plus what the ESLint configuration asks for.
 *
 * Asking for a rule from ESLint enables it even when the file's configuration does not mention it,
 * because that is what the request means; the file's configuration still decides selectors and
 * node-level overrides.
 *
 * @param config - the file's own configuration
 * @param enabled - rules ESLint asked for, with their options
 * @returns the configuration to build the ruleset from
 */
const mergeEnabled = (
  config: Readonly<Config>,
  enabled: Record<string, unknown>,
): Config => {
  const mergedRules: Record<string, unknown> = { ...config.rules }

  for (const [name, options] of Object.entries(enabled)) {
    mergedRules[name] = options ?? true
  }

  return { ...config, rules: mergedRules as Rules }
}

/**
 * Creates the runner a worker uses for every file it is asked about.
 *
 * markuplint's rules and each file's configuration are both expensive to resolve and deterministic,
 * so the runner resolves them once and reuses them: `ConfigProvider` caches by the resolved
 * configuration's file names, and the rule list is a constant.
 *
 * @returns a function that runs one markuplint pass for a file
 */
export const createMarkupPass = () => {
  let configProvider: ConfigProvider | undefined
  let resolvedRules: Promise<readonly unknown[]> | undefined
  const fileCache = new Map<string, Promise<MLFile>>()

  const getConfigProvider = () => (configProvider ??= new ConfigProvider())

  const getResolvedRules = () =>
    (resolvedRules ??= resolveRules([], new Ruleset({ rules: {} }), true))

  const getFile = (sourceCode: string, filename: string) => {
    let file = fileCache.get(filename)
    if (!file) {
      file = resolveFiles([{ sourceCode, name: filename }]).then(
        files => files[0],
      )
      fileCache.set(filename, file)
    }
    return file
  }

  /**
   * Resolves the configuration a file is checked against, following the precedence the CLI and
   * `MLEngine` use: the file's own configuration, else `markuplint:recommended`.
   */
  const configFor = async (file: Readonly<MLFile>) =>
    getConfigProvider().runExclusive(async () => {
      const provider = getConfigProvider()
      const own = await provider.search(file)
      const recommended = own ? null : provider.set(RECOMMENDED)
      return provider.resolve(file, [own, recommended])
    })

  return async ({
    sourceCode,
    filename,
    rules: enabled,
    fix,
  }: MarkupPassOptions): Promise<MarkupPassResult> => {
    const file = await getFile(sourceCode, filename)

    const [configSet, rulesList, { parser, parserOptions }, { schemas }] =
      await Promise.all([
        configFor(file),
        getResolvedRules(),
        resolveParser(file),
        resolveSpecs(filename),
      ])

    const core = new MLCore({
      parser,
      parserOptions,
      sourceCode,
      filename,
      ruleset: new Ruleset(mergeEnabled(configSet.config, enabled)),
      rules: rulesList,
      pretenders: [],
      schemas,
      locale: i18n(),
      ruleCommonSettings: configSet.config.ruleCommonSettings ?? {},
      // ! `MLCore` reads `severity.deprecation` without a guard, so an unset severity has to
      // ! become an empty object rather than `undefined`
      severity: configSet.config.severity ?? {},
      configErrors: configSet.errs,
    } as never)

    const result = await core.verify(!!fix)

    return {
      violations: result.violations.map(violation => ({
        ruleId: violation.ruleId,
        severity: violation.severity,
        message: violation.message,
        line: violation.line,
        col: violation.col,
        raw: violation.raw,
      })),
      fixedCode: result.fixedCode ?? sourceCode,
    }
  }
}
