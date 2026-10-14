import path from 'node:path'

import type { TSESLint } from '@typescript-eslint/utils'
import { createSyncFn } from 'synckit'

import { _dirname } from './constants.js'
import type { MarkupPassOptions, MarkupPassResult } from './pass.js'
import { MARKUPLINT_RULE_NAMES } from './rule-names.js'

/**
 * markuplint runs every rule it is given in one pass over one document, so the plugin reports from
 * a single pass too: this is that pass, over the synckit worker that keeps it synchronous for
 * ESLint.
 */
const markuplintPass = createSyncFn<
  (options: MarkupPassOptions) => Promise<MarkupPassResult>
>(path.resolve(_dirname, './pass-worker.js'))

/**
 * What one file needs from the pass, gathered from the ESLint rules enabled for it.
 *
 * ESLint calls every enabled rule's `create()` before it visits anything, so the first visitor sees
 * a complete picture of what the file asked for.
 */
interface FilePass {
  rules: Record<string, unknown>
  result?: MarkupPassResult
  error?: Error
}

/** Keyed by `SourceCode`, so a file's rules share one pass and two files share nothing. */
const filePasses = new WeakMap<object, FilePass>()

/**
 * Runs the pass a file needs, once, however many rules ask for it.
 *
 * @param sourceCode - the source code object the rules run against
 * @param filePass - the file's accumulated request
 * @returns the pass result, or the failure it hit
 */
const runPass = (
  filePass: FilePass,
  text: string,
  filename: string,
): FilePass => {
  if (!filePass.result && !filePass.error) {
    try {
      filePass.result = markuplintPass({
        sourceCode: text,
        filename,
        rules: filePass.rules,
      })
    } catch (error) {
      filePass.error = error as Error
    }
  }

  return filePass
}

/**
 * Creates the ESLint rule for one markuplint rule.
 *
 * Every rule of the plugin is this same rule under a different name: the name decides which of the
 * single pass's violations this rule reports, while ESLint decides what severity that is and
 * whether it is enabled at all.
 *
 * @param name - the markuplint rule name, which becomes `markup/<name>` in a config
 * @returns the ESLint rule
 */
export const createRule = (name: string): TSESLint.RuleModule<never> => ({
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description: `${name}, as implemented by markuplint`,
    },
    // markuplint owns the wording of its violations, so the rule carries one placeholder and
    // passes the text through `data`
    messages: { markuplint: '{{message}}' },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    // the module exposes one placeholder message, which is what the rule reports through
    const reporting = context as unknown as TSESLint.RuleContext<
      'markuplint',
      []
    >
    const { sourceCode } = reporting
    const text = sourceCode.text
    const filename = reporting.filename

    let filePass = filePasses.get(sourceCode)
    if (filePass) {
      filePass.rules[name] = (reporting.options as unknown[])[0] ?? true
    } else {
      // an enabled rule with no options is "on", which markuplint spells `true`
      filePass = {
        rules: { [name]: (reporting.options as unknown[])[0] ?? true },
      }
      filePasses.set(sourceCode, filePass)
    }

    const report = () => {
      const { result, error } = runPass(filePass, text, filename)

      if (error) {
        throw error
      }

      let fixed = 0

      for (const violation of result?.violations ?? []) {
        if (violation.ruleId !== name) {
          continue
        }

        reporting.report({
          messageId: 'markuplint',
          data: { message: violation.message },
          loc: {
            line: violation.line,
            // ! eslint columns are 0-based, markuplint's are 1-based
            column: violation.col - 1,
          },
          fix() {
            if (fixed++) {
              return null
            }

            const { fixedCode } = markuplintPass({
              sourceCode: text,
              filename,
              rules: filePass.rules,
              fix: true,
            })

            return fixedCode === text
              ? null
              : { range: [0, text.length], text: fixedCode }
          },
        })
      }
    }

    // the language's root node and the stub parser's, so both configurations work
    return { Document: report, Program: report }
  },
})

/** Every markuplint rule this plugin exposes, keyed by its markuplint name. */
export const mappedRules: Record<
  string,
  TSESLint.RuleModule<never>
> = Object.fromEntries(
  MARKUPLINT_RULE_NAMES.map(name => [name, createRule(name)]),
)
